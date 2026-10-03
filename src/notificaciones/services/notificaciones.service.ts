// src/notificaciones/services/notificaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { NotificacionLectura } from '../entities/notificacion-lectura.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Recordatorio } from 'src/vehiculos/entities/recordatorio.entity';
import { ValidRoles, Permisos } from 'src/usuario/enums/usuario.enum';

export type VistaAvisos = { dni: number; esSuperadmin: boolean };

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(NotificacionLectura)
    private readonly lecturaRepository: Repository<NotificacionLectura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,
  ) {}

  // Ids de recordatorios que puede ver un admin: los que creo, los dirigidos a el y los de "todos"
  private async idsRecordatoriosVisibles(dni: number): Promise<number[]> {
    const filas = await this.recordatorioRepository.find({
      select: { id: true },
      where: [{ usuario: { dni } }, { destinoDni: dni }, { paraTodos: true }],
    });
    return filas.map((r) => r.id);
  }

  async crearNotificacionParaSuperadmin(
    tipo: string,
    titulo: string,
    mensaje: string,
    referenciaTipo?: string,
    referenciaId?: number,
  ): Promise<Notificacion[]> {
    const superadmins = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.usuarioRoles', 'usuarioRol')
      .innerJoin('usuarioRol.rol', 'rol')
      .where('rol.rol = :rol', { rol: ValidRoles.superadmin })
      .getMany();

    if (superadmins.length === 0) {
      return [];
    }

    // Se guarda una única fila (no una por superadmin) para evitar duplicados
    // en la vista de notificaciones, ya que obtenerPorTipo no filtra por dniUsuario.
    const nueva = this.notificacionRepository.create({
      tipo,
      titulo,
      mensaje,
      leida: false,
      dniUsuario: superadmins[0].dni,
      referenciaTipo: referenciaTipo ?? null,
      referenciaId: referenciaId ?? null,
    });

    return [await this.notificacionRepository.save(nueva)];
  }

  // Tipos de notificacion que puede ver un usuario segun sus roles y permisos
  tiposPermitidos(
    roles: { rol: string; permisos?: string[] | null }[],
  ): Set<string> {
    const permitidos = new Set<string>();
    const rolesUsuario = roles ?? [];

    if (rolesUsuario.some((r) => r.rol === ValidRoles.superadmin)) {
      [
        'service', 'reparacion', 'compras', 'incidentes', 'personal',
        'recordatorio', 'combustible', 'proveedores', 'lubricentro',
        'privada', 'almacen',
      ].forEach((t) => permitidos.add(t));
      return permitidos;
    }

    const perms: string[] = rolesUsuario.flatMap((r) => r.permisos ?? []);
    const tiene = (...p: Permisos[]) => p.some((x) => perms.includes(x));
    const acceso = tiene(Permisos.ALL_READ, Permisos.ALL_WRITE);

    if (acceso) {
      [
        'service', 'lubricentro', 'combustible', 'almacen',
        'reparacion', 'compras', 'incidentes', 'proveedores',
      ].forEach((t) => permitidos.add(t));
    }
    if (tiene(Permisos.SERVICE_READ, Permisos.SERVICE_WRITE)) {
      permitidos.add('service');
    }
    if (tiene(Permisos.LUBRICENTRO_READ, Permisos.LUBRICENTRO_WRITE)) {
      permitidos.add('lubricentro');
    }
    if (tiene(Permisos.COMBUSTIBLE_WRITE)) {
      permitidos.add('combustible');
    }
    if (
      tiene(
        Permisos.ALMACEN_TALLER_READ,
        Permisos.ALMACEN_TALLER_WRITE,
        Permisos.ALMACEN_COMUN_READ,
        Permisos.ALMACEN_COMUN_WRITE,
      )
    ) {
      permitidos.add('almacen');
    }
    if (tiene(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)) {
      permitidos.add('personal');
    }
    // Recordatorios y privada visibles para admin (como antes); personal solo con permiso propio
    permitidos.add('recordatorio');
    permitidos.add('privada');
    return permitidos;
  }

  async contarNoLeidasPorTipo(
    permitidos: Set<string>,
    vista?: VistaAvisos,
  ): Promise<Record<string, number>> {
    const qb = this.notificacionRepository
      .createQueryBuilder('n')
      .select('n.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .where('1 = 1');
    if (vista) {
      qb.andWhere(
        'NOT EXISTS (SELECT 1 FROM notificacion_lectura l WHERE l.notificacion_id = n.id AND l.dni = :dniLector)',
        { dniLector: vista.dni },
      );
    } else {
      qb.andWhere('n.leida = :leida', { leida: false });
    }
    if (vista && !vista.esSuperadmin) {
      const ids = await this.idsRecordatoriosVisibles(vista.dni);
      qb.andWhere(
        "(n.tipo <> 'recordatorio' OR (n.referenciaTipo = 'recordatorio' AND n.referenciaId IN (:...ids)))",
        { ids: ids.length > 0 ? ids : [0] },
      );
    }
    const filas = await qb
      .groupBy('n.tipo')
      .getRawMany<{ tipo: string; total: string }>();

    const resultado: Record<string, number> = {};
    for (const f of filas) {
      // Solo se informan los tipos a los que el usuario tiene acceso
      if (!permitidos.has(f.tipo)) continue;
      resultado[f.tipo] = Number(f.total);
    }
    return resultado;
  }

  async obtenerPorTipo(
    tipo: string,
    vista?: VistaAvisos,
  ): Promise<Notificacion[]> {
    let filas: Notificacion[];
    if (tipo === 'recordatorio' && vista && !vista.esSuperadmin) {
      const ids = await this.idsRecordatoriosVisibles(vista.dni);
      if (ids.length === 0) return [];
      filas = await this.notificacionRepository.find({
        where: { tipo, referenciaTipo: 'recordatorio', referenciaId: In(ids) },
        order: { fecha: 'DESC' },
      });
    } else {
      filas = await this.notificacionRepository.find({
        where: { tipo },
        order: { fecha: 'DESC' },
      });
    }
    if (!vista) return filas;
    // "leida" se calcula por persona: solo cuenta si ESTA persona lo leyo
    const leidas = await this.idsLeidosPor(
      vista.dni,
      filas.map((f) => f.id),
    );
    return filas.map((f) => ({ ...f, leida: leidas.has(f.id) }) as Notificacion);
  }

  // Ids (de la lista dada) que esta persona ya leyo
  private async idsLeidosPor(dni: number, ids: number[]): Promise<Set<number>> {
    if (ids.length === 0) return new Set<number>();
    const filas = await this.lecturaRepository.find({
      where: { dni, notificacionId: In(ids) },
    });
    return new Set(filas.map((l) => Number(l.notificacionId)));
  }

  // Marca como leidos (solo para esta persona) los avisos dados
  private async marcarLeidosPor(dni: number, ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const ya = await this.idsLeidosPor(dni, ids);
    const nuevos = ids.filter((i) => !ya.has(i));
    if (nuevos.length === 0) return 0;
    await this.lecturaRepository
      .createQueryBuilder()
      .insert()
      .values(nuevos.map((notificacionId) => ({ notificacionId, dni })))
      .orIgnore()
      .execute();
    return nuevos.length;
  }

  async marcarTipoComoLeido(
    tipo: string,
    vista?: VistaAvisos,
  ): Promise<{ actualizadas: number }> {
    if (vista) {
      const visibles = await this.obtenerPorTipo(tipo, vista);
      const sinLeer = visibles.filter((n) => !n.leida).map((n) => n.id);
      const cant = await this.marcarLeidosPor(vista.dni, sinLeer);
      return { actualizadas: cant };
    }
    const r = await this.notificacionRepository.update(
      { tipo, leida: false },
      { leida: true },
    );
    return { actualizadas: r.affected ?? 0 };
  }

  async marcarComoLeida(
    id: number,
    permitidos?: Set<string>,
    vista?: VistaAvisos,
  ): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    // Si no tiene acceso a ese tipo, se responde como si no existiera
    if (permitidos && !permitidos.has(notificacion.tipo)) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    // Aviso de recordatorio: un admin solo toca los de recordatorios que puede ver
    if (notificacion.tipo === 'recordatorio' && vista && !vista.esSuperadmin) {
      const ids = await this.idsRecordatoriosVisibles(vista.dni);
      const visible =
        notificacion.referenciaTipo === 'recordatorio' &&
        notificacion.referenciaId !== null &&
        ids.includes(Number(notificacion.referenciaId));
      if (!visible) {
        throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
      }
    }
    if (vista) {
      await this.marcarLeidosPor(vista.dni, [notificacion.id]);
      return { ...notificacion, leida: true } as Notificacion;
    }
    notificacion.leida = true;
    return this.notificacionRepository.save(notificacion);
  }

  async eliminar(id: number): Promise<{ eliminada: boolean }> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    await this.notificacionRepository.delete({ id });
    return { eliminada: true };
  }
}