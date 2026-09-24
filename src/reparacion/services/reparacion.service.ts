// src/reparacion/services/reparacion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reparacion } from '../entities/reparacion.entity';
import { CreateReparacionDto } from '../dto/create-reparacion.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

const TITULO_MAX = 150;

const CAMPOS_COMPARABLES: {
  clave: 'descripcion' | 'taller' | 'fecha_entrada' | 'fecha_salida' | 'observaciones';
  etiqueta: string;
}[] = [
  { clave: 'descripcion', etiqueta: 'descripción' },
  { clave: 'taller', etiqueta: 'taller' },
  { clave: 'fecha_entrada', etiqueta: 'fecha de entrada' },
  { clave: 'fecha_salida', etiqueta: 'fecha de salida' },
  { clave: 'observaciones', etiqueta: 'observaciones' },
];

@Injectable()
export class ReparacionService {
  constructor(
    @InjectRepository(Reparacion)
    private readonly reparacionRepository: Repository<Reparacion>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private armarTitulo(
    accion: 'cargada' | 'editada',
    r: Reparacion,
    cambios: string[] = [],
  ): string {
    const v = r.vehiculo;
    const vehiculo = v
      ? `${v.nombre}${v.codigo ? ` (cód. ${v.codigo})` : ''}`
      : 'vehículo sin datos';
    const partes = [`Reparación ${accion}`, vehiculo, r.taller];
    if (cambios.length > 0) {
      partes.push(`cambió: ${cambios.join(', ')}`);
    }
    const titulo = partes.join(' · ');
    return titulo.length > TITULO_MAX
      ? titulo.slice(0, TITULO_MAX - 1) + '…'
      : titulo;
  }

  private armarMensaje(r: Reparacion): string {
    return [
      `Taller: ${r.taller}`,
      `Fecha de entrada: ${r.fecha_entrada}`,
      r.fecha_salida ? `Fecha de salida: ${r.fecha_salida}` : null,
      `Descripción: ${r.descripcion}`,
      r.observaciones ? `Observaciones: ${r.observaciones}` : null,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  async crear(dto: CreateReparacionDto): Promise<Reparacion> {
    const nueva = this.reparacionRepository.create({
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    const guardada = await this.reparacionRepository.save(nueva);
    const conVehiculo = await this.obtenerUno(guardada.id);

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'reparacion',
      this.armarTitulo('cargada', conVehiculo),
      this.armarMensaje(conVehiculo),
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
    const existente = await this.obtenerUno(id);

    const { id_vehiculo, ...resto } = dto;

    const cambios: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES) {
      const nuevo = resto[clave];
      if (nuevo === undefined) continue;
      if (String(nuevo ?? '') !== String(existente[clave] ?? '')) {
        cambios.push(etiqueta);
      }
    }
    if (existente.vehiculo?.id_vehiculo !== id_vehiculo) {
      cambios.push('vehículo');
    }

    await this.reparacionRepository.update(id, {
      ...resto,
      vehiculo: { id_vehiculo } as any,
    });
    const actualizada = await this.obtenerUno(id);

    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'reparacion',
      this.armarTitulo('editada', actualizada, cambios),
      this.armarMensaje(actualizada),
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
