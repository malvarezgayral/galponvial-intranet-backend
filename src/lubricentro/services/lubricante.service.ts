// src/lubricentro/services/lubricante.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lubricante } from '../entities/lubricante.entity';
import { CreateLubricanteDto } from '../dto/create-lubricante.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class LubricanteService {
  constructor(
    @InjectRepository(Lubricante)
    private readonly lubricanteRepository: Repository<Lubricante>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private tituloLubricante(
    accion: string,
    lubricante: { vehiculo: { nombre: string; codigo?: string | null }; tipo: string; cantidad: number },
    cambios: string[] = [],
  ): string {
    const TITULO_MAX_LUBRICANTE = 150;
    const identificadorVehiculo = lubricante.vehiculo.codigo
      ? `${lubricante.vehiculo.nombre} (cód. ${lubricante.vehiculo.codigo})`
      : lubricante.vehiculo.nombre;
    const partes = [
      `Lubricante ${accion}`,
      identificadorVehiculo,
      `${lubricante.cantidad} L ${lubricante.tipo}`,
    ];
    if (cambios.length > 0) {
      partes.push(`cambió: ${cambios.join(', ')}`);
    }
    const titulo = partes.join(' · ');
    return titulo.length > TITULO_MAX_LUBRICANTE
      ? titulo.slice(0, TITULO_MAX_LUBRICANTE - 1) + '…'
      : titulo;
  }

  async crear(dto: CreateLubricanteDto): Promise<Lubricante> {
    const nuevo = this.lubricanteRepository.create({
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    const guardado = await this.lubricanteRepository.save(nuevo);
    const guardadoCompleto = await this.obtenerUno(guardado.id);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.tituloLubricante('cargado', guardadoCompleto),
      `Se cargó un registro de Lubricentro para ${guardadoCompleto.vehiculo.nombre}.`,
    );
    return guardadoCompleto;
  }

  async obtenerTodos(): Promise<Lubricante[]> {
    return this.lubricanteRepository.find({ relations: ['vehiculo'] });
  }

  async obtenerUno(id: number): Promise<Lubricante> {
    const lubricante = await this.lubricanteRepository.findOne({
      where: { id },
      relations: ['vehiculo'],
    });
    if (!lubricante) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }
    return lubricante;
  }

  async actualizar(
    id: number,
    dto: CreateLubricanteDto,
  ): Promise<Lubricante> {
    const existente = await this.lubricanteRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }

    const CAMPOS_COMPARABLES_LUBRICANTE: { clave: string; etiqueta: string }[] = [
      { clave: 'fecha', etiqueta: 'fecha' },
      { clave: 'ordenRetiro', etiqueta: 'orden de retiro' },
      { clave: 'cantidad', etiqueta: 'cantidad' },
      { clave: 'tipo', etiqueta: 'tipo' },
      { clave: 'observaciones', etiqueta: 'observaciones' },
    ];
    const cambiosLubricante: string[] = [];
    for (const { clave, etiqueta } of CAMPOS_COMPARABLES_LUBRICANTE) {
      const nuevo = (dto as any)[clave];
      if (nuevo !== undefined && String(nuevo ?? '') !== String((existente as any)[clave] ?? '')) {
        cambiosLubricante.push(etiqueta);
      }
    }
    if (dto.id_vehiculo !== undefined && dto.id_vehiculo !== (existente as any).id_vehiculo) {
      cambiosLubricante.push('vehículo');
    }

    await this.lubricanteRepository.update(id, {
      ...dto,
      vehiculo: { id_vehiculo: dto.id_vehiculo } as any,
    });
    const actualizado = await this.obtenerUno(id);
    await this.notificacionesService.crearNotificacionParaSuperadmin(
      'lubricentro',
      this.tituloLubricante('editado', actualizado, cambiosLubricante),
      `Se editó el registro de Lubricentro de ${actualizado.vehiculo.nombre}.`,
    );
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    const existente = await this.lubricanteRepository.findOneBy({ id });
    if (!existente) {
      throw new NotFoundException(`Lubricante con ID ${id} no encontrado`);
    }
    await this.lubricanteRepository.delete(id);
  }
}
