// src/notificaciones/services/notificaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles, Permisos } from 'src/usuario/enums/usuario.enum';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

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
    // Recordatorios, personal y privada: solo superadmin (provisorio)
    return permitidos;
  }

  async contarNoLeidasPorTipo(
    permitidos: Set<string>,
  ): Promise<Record<string, number>> {
    const filas = await this.notificacionRepository
      .createQueryBuilder('n')
      .select('n.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .where('n.leida = :leida', { leida: false })
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

  async obtenerPorTipo(tipo: string): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { tipo },
      order: { fecha: 'DESC' },
    });
  }

  async marcarTipoComoLeido(tipo: string): Promise<{ actualizadas: number }> {
    const r = await this.notificacionRepository.update(
      { tipo, leida: false },
      { leida: true },
    );
    return { actualizadas: r.affected ?? 0 };
  }

  async marcarComoLeida(id: number, permitidos?: Set<string>): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    // Si no tiene acceso a ese tipo, se responde como si no existiera
    if (permitidos && !permitidos.has(notificacion.tipo)) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
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