// src/reparacion/services/reparacion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reparacion } from '../entities/reparacion.entity';
import { CreateReparacionDto } from '../dto/create-reparacion.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class ReparacionService {
  constructor(
    @InjectRepository(Reparacion)
    private readonly reparacionRepository: Repository<Reparacion>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async crear(dto: CreateReparacionDto): Promise<Reparacion> {
    const nueva = this.reparacionRepository.create({
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    const guardada = await this.reparacionRepository.save(nueva);

    const mensaje = [
      `Taller: ${guardada.taller}`,
      `Fecha de entrada: ${guardada.fecha_entrada}`,
      guardada.fecha_salida ? `Fecha de salida: ${guardada.fecha_salida}` : null,
      `Descripción: ${guardada.descripcion}`,
      guardada.observaciones ? `Observaciones: ${guardada.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'reparacion',
      'Nuevo registro de Reparación cargado',
      mensaje,
    );

    return guardada;
  }

  async obtenerTodos(): Promise<Reparacion[]> {
    return this.reparacionRepository.find({ relations: ['vehiculo'] });
  }

  async obtenerUno(id: number): Promise<Reparacion> {
    const reparacion = await this.reparacionRepository.findOne({
      where: { id },
      relations: ['vehiculo'],
    });
    if (!reparacion) {
      throw new NotFoundException(`Reparación con ID ${id} no encontrada`);
    }
    return reparacion;
  }

  async actualizar(id: number, dto: CreateReparacionDto): Promise<Reparacion> {
    const existente = await this.reparacionRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Reparación con ID ${id} no encontrada`);
    }
    await this.reparacionRepository.update(id, {
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    const actualizada = await this.obtenerUno(id);

    const mensaje = [
      `Taller: ${actualizada.taller}`,
      `Fecha de entrada: ${actualizada.fecha_entrada}`,
      actualizada.fecha_salida ? `Fecha de salida: ${actualizada.fecha_salida}` : null,
      `Descripción: ${actualizada.descripcion}`,
      actualizada.observaciones ? `Observaciones: ${actualizada.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'reparacion',
      'Registro de Reparación editado',
      mensaje,
    );

    return actualizada;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.reparacionRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Reparación con ID ${id} no encontrada`);
    }
    await this.reparacionRepository.delete(id);
  }
}
