// src/mensajes-privados/services/mensajes-privados.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { MensajePrivado } from '../entities/mensaje-privado.entity';
import { CreateMensajePrivadoDto } from '../dto/create-mensaje-privado.dto';
import { Notificacion } from 'src/notificaciones/entities/notificacion.entity';
import { NotificacionLectura } from 'src/notificaciones/entities/notificacion-lectura.entity';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

export type MensajePrivadoDto = {
  id: number;
  asunto: string | null;
  texto: string;
  fecha: Date;
  leido: boolean;
};

// Un mensaje del chat visto por quien consulta: "mio" = lo escribio el
export type ChatMensaje = {
  id: number;
  texto: string;
  fecha: Date;
  mio: boolean;
  leido: boolean;
};

export type ChatAdmin = {
  dni: number;
  nombre: string;
  apellido: string;
  sinLeer: number;
  ultimo: Date | null;
};

@Injectable()
export class MensajesPrivadosService {
  constructor(
    @InjectRepository(MensajePrivado)
    private readonly mensajeRepository: Repository<MensajePrivado>,
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(NotificacionLectura)
    private readonly lecturaRepository: Repository<NotificacionLectura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // ---------- Mensajes ----------

  // Un admin le escribe al superadmin: se guarda y le llega en Notificaciones > Privado
  async crearMensaje(autor: Usuario, dto: CreateMensajePrivadoDto): Promise<MensajePrivadoDto> {
    const dni = Number(autor.dni);
    const asunto = dto.asunto.trim();
    const texto = dto.texto.trim();
    const guardado = await this.mensajeRepository.save(
      this.mensajeRepository.create({ dniAdmin: dni, dniAutor: dni, tipo: 'mensaje', asunto, texto }),
    );
    const titulo = `Mensaje privado de ${autor.nombre} ${autor.apellido}`.slice(0, 150);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'privada',
      titulo,
      `${asunto}: ${texto}`,
      'mensaje_privado',
      guardado.id,
    );
    return { id: guardado.id, asunto, texto, fecha: guardado.fecha, leido: false };
  }

  // Solo los mensajes del admin que consulta
  async misMensajes(dniAdmin: number): Promise<MensajePrivadoDto[]> {
    const mensajes = await this.mensajeRepository.find({
      where: { dniAdmin, tipo: 'mensaje' },
      order: { fecha: 'DESC' },
    });
    const leidos = await this.idsLeidosPorSuperadmin(mensajes.map((m) => m.id));
    return mensajes.map((m) => ({
      id: m.id,
      asunto: m.asunto ?? null,
      texto: m.texto,
      fecha: m.fecha,
      leido: leidos.has(m.id),
    }));
  }

  // "Leido" = algun superadmin marco como leida la notificacion de ese mensaje
  private async idsLeidosPorSuperadmin(ids: number[]): Promise<Set<number>> {
    if (ids.length === 0) return new Set<number>();
    const avisos = await this.notificacionRepository.find({
      select: { id: true, referenciaId: true },
      where: { tipo: 'privada', referenciaTipo: 'mensaje_privado', referenciaId: In(ids) },
    });
    if (avisos.length === 0) return new Set<number>();
    const superadmins = await this.dnisSuperadmin();
    if (superadmins.length === 0) return new Set<number>();
    const lecturas = await this.lecturaRepository.find({
      where: {
        notificacionId: In(avisos.map((a) => a.id)),
        dni: In(superadmins),
      },
    });
    const avisosLeidos = new Set(lecturas.map((l) => Number(l.notificacionId)));
    return new Set(
      avisos.filter((a) => avisosLeidos.has(a.id)).map((a) => Number(a.referenciaId)),
    );
  }

  // ---------- Chat (solo superadmin <-> un admin) ----------

  esSuperadmin(user: Usuario): boolean {
    return (user.roles ?? []).some((r) => r.rol === ValidRoles.superadmin);
  }

  private async dnisSuperadmin(): Promise<number[]> {
    const filas = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.usuarioRoles', 'usuarioRol')
      .innerJoin('usuarioRol.rol', 'rol')
      .where('rol.rol = :rol', { rol: ValidRoles.superadmin })
      .getMany();
    return filas.map((u) => Number(u.dni));
  }

  // Admins activos con los que el superadmin puede chatear (sin superadmins)
  private async adminsChateables(): Promise<Usuario[]> {
    const admins = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.usuarioRoles', 'usuarioRol')
      .innerJoin('usuarioRol.rol', 'rol')
      .where('rol.rol = :rol', { rol: ValidRoles.admin })
      .andWhere('usuario.isActive = :activo', { activo: true })
      .orderBy('usuario.apellido', 'ASC')
      .getMany();
    const supers = new Set(await this.dnisSuperadmin());
    return admins.filter((u) => !supers.has(Number(u.dni)));
  }

  private async verificarAdmin(dniAdmin: number): Promise<void> {
    const admins = await this.adminsChateables();
    if (!admins.some((u) => Number(u.dni) === dniAdmin)) {
      throw new NotFoundException('Admin no encontrado');
    }
  }

  private aChat(m: MensajePrivado, paraSuperadmin: boolean): ChatMensaje {
    const delAdmin = Number(m.dniAutor) === Number(m.dniAdmin);
    return {
      id: m.id,
      texto: m.texto,
      fecha: m.fecha,
      mio: paraSuperadmin ? !delAdmin : delAdmin,
      leido: !!m.leidoEn,
    };
  }

  // Marca como leidos los mensajes del otro participante
  private async marcarLeidos(dniAdmin: number, losDelAdmin: boolean): Promise<void> {
    await this.mensajeRepository
      .createQueryBuilder()
      .update(MensajePrivado)
      .set({ leidoEn: () => 'now()' })
      .where('dni_admin = :dniAdmin', { dniAdmin })
      .andWhere("tipo = 'chat'")
      .andWhere('leido_en IS NULL')
      .andWhere(losDelAdmin ? 'dni_autor = dni_admin' : 'dni_autor <> dni_admin')
      .execute();
  }

  private async conversacion(dniAdmin: number, paraSuperadmin: boolean): Promise<ChatMensaje[]> {
    const filas = await this.mensajeRepository.find({
      where: { dniAdmin, tipo: 'chat' },
      order: { fecha: 'ASC', id: 'ASC' },
    });
    return filas.map((m) => this.aChat(m, paraSuperadmin));
  }

  // Admin: su unica conversacion, con el superadmin
  async chatDelAdmin(user: Usuario): Promise<ChatMensaje[]> {
    if (this.esSuperadmin(user)) {
      throw new ForbiddenException('El superadmin chatea eligiendo un admin');
    }
    const dni = Number(user.dni);
    await this.marcarLeidos(dni, false);
    return this.conversacion(dni, false);
  }

  async escribirComoAdmin(user: Usuario, texto: string): Promise<ChatMensaje> {
    if (this.esSuperadmin(user)) {
      throw new ForbiddenException('El superadmin chatea eligiendo un admin');
    }
    const dni = Number(user.dni);
    const limpio = texto.trim();
    const guardado = await this.mensajeRepository.save(
      this.mensajeRepository.create({ dniAdmin: dni, dniAutor: dni, tipo: 'chat', asunto: null, texto: limpio }),
    );
    const titulo = `Chat de ${user.nombre} ${user.apellido}`.slice(0, 150);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'chats',
      titulo,
      limpio,
      'chat_privado',
      guardado.id,
    );
    return this.aChat(guardado, false);
  }

  // Superadmin: lista de admins con sin leer y ultimo mensaje
  async listarAdminsChat(): Promise<ChatAdmin[]> {
    const admins = await this.adminsChateables();
    const stats = await this.mensajeRepository
      .createQueryBuilder('m')
      .select('m.dni_admin', 'dni')
      .addSelect('MAX(m.fecha)', 'ultimo')
      .addSelect(
        'SUM(CASE WHEN m.dni_autor = m.dni_admin AND m.leido_en IS NULL THEN 1 ELSE 0 END)',
        'sin_leer',
      )
      .where("m.tipo = 'chat'")
      .groupBy('m.dni_admin')
      .getRawMany<{ dni: string; ultimo: Date | null; sin_leer: string }>();
    const porDni = new Map(stats.map((s) => [Number(s.dni), s]));
    const lista = admins.map((u) => {
      const s = porDni.get(Number(u.dni));
      return {
        dni: Number(u.dni),
        nombre: u.nombre,
        apellido: u.apellido,
        sinLeer: s ? Number(s.sin_leer) : 0,
        ultimo: s ? s.ultimo : null,
      };
    });
    // Primero los que tienen charla reciente; el resto por apellido
    return lista.sort((a, b) => {
      if (a.ultimo && b.ultimo) return new Date(b.ultimo).getTime() - new Date(a.ultimo).getTime();
      if (a.ultimo) return -1;
      if (b.ultimo) return 1;
      return a.apellido.localeCompare(b.apellido);
    });
  }

  async chatConAdmin(dniAdmin: number): Promise<ChatMensaje[]> {
    await this.verificarAdmin(dniAdmin);
    await this.marcarLeidos(dniAdmin, true);
    return this.conversacion(dniAdmin, true);
  }

  async escribirComoSuperadmin(user: Usuario, dniAdmin: number, texto: string): Promise<ChatMensaje> {
    await this.verificarAdmin(dniAdmin);
    const guardado = await this.mensajeRepository.save(
      this.mensajeRepository.create({
        dniAdmin,
        dniAutor: Number(user.dni),
        tipo: 'chat',
        asunto: null,
        texto: texto.trim(),
      }),
    );
    return this.aChat(guardado, true);
  }

  // Para el globito de la navbar
  async chatNoLeidos(user: Usuario): Promise<{ noLeidos: number }> {
    if (this.esSuperadmin(user)) {
      const n = await this.mensajeRepository
        .createQueryBuilder('m')
        .where("m.tipo = 'chat'")
        .andWhere('m.dni_autor = m.dni_admin')
        .andWhere('m.leido_en IS NULL')
        .getCount();
      return { noLeidos: n };
    }
    const dni = Number(user.dni);
    const n = await this.mensajeRepository.count({
      where: { dniAdmin: dni, tipo: 'chat', dniAutor: Not(dni), leidoEn: IsNull() },
    });
    return { noLeidos: n };
  }
}
