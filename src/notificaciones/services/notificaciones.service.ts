// src/notificaciones/services/notificaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

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

    const nuevas = superadmins.map((superadmin) =>
      this.notificacionRepository.create({
        tipo,
        titulo,
        mensaje,
        leida: false,
        dniUsuario: superadmin.dni,
      }),
    );

    return this.notificacionRepository.save(nuevas);
  }

  async obtenerPorTipo(tipo: string): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { tipo },
      order: { fecha: 'DESC' },
    });
  }

  async marcarComoLeida(id: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    notificacion.leida = true;
    return this.notificacionRepository.save(notificacion);
  }
}