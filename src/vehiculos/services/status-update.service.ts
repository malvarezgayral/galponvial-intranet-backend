import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StatusUpdate } from '../entities/status-update.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Injectable()
export class StatusUpdateService {
  constructor(
    @InjectRepository(StatusUpdate)
    private readonly statusUpdateRepository: Repository<StatusUpdate>,
  ) {}

  /**
   * Cerrar el status actual del vehículo (establecer fecha_hasta)
   */
  async cerrarStatusActual(idVehiculo: number): Promise<void> {
    const statusActual = await this.statusUpdateRepository.findOne({
      where: {
        vehiculo: { id_vehiculo: idVehiculo },
        fecha_hasta: IsNull(),
      },
      order: { fecha_desde: 'DESC' },
    });

    if (statusActual) {
      statusActual.fecha_hasta = new Date();
      await this.statusUpdateRepository.save(statusActual);
    }
  }

  /**
   * Crear un nuevo registro de status
   */
  async crearStatusUpdate(
    vehiculo: Vehiculo,
    nuevoStatus: VehiculoStatus,
  ): Promise<StatusUpdate> {
    const statusUpdate = this.statusUpdateRepository.create({
      tipo: nuevoStatus,
      fecha_desde: new Date(),
      fecha_hasta: null,
      vehiculo,
    });

    return await this.statusUpdateRepository.save(statusUpdate);
  }
}