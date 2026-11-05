// src/mensajes-privados/services/mensajes-privados.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    const superadmins = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.usuarioRoles', 'usuarioRol')
      .innerJoin('usuarioRol.rol', 'rol')
      .where('rol.rol = :rol', { rol: ValidRoles.superadmin })
      .getMany();
    if (superadmins.length === 0) return new Set<number>();
    const lecturas = await this.lecturaRepository.find({
      where: {
        notificacionId: In(avisos.map((a) => a.id)),
        dni: In(superadmins.map((s) => s.dni)),
      },
    });
    const avisosLeidos = new Set(lecturas.map((l) => Number(l.notificacionId)));
    return new Set(
      avisos.filter((a) => avisosLeidos.has(a.id)).map((a) => Number(a.referenciaId)),
    );
  }
}
