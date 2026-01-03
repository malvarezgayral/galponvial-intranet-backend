import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusUpdate } from '../entities/status-update.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Injectable()
export class StatusUpdateService {
  constructor(
    @InjectRepository(StatusUpdate)
    private readonly statusUpdateRepository: Repository<StatusUpdate>,
  ) {}

  async crearStatusUpdate(
    vehiculo: Vehiculo,
    nuevoStatus: VehiculoStatus,
  ): Promise<StatusUpdate | null> {
    const lastStatus = await this.obtenerUltimoStatus(vehiculo.id_vehiculo);

    // Solo crear StatusUpdate si existe un status previo (transición de status)
    if (lastStatus) {
      const newStatusUpdate = this.statusUpdateRepository.create({
        tipo: nuevoStatus,
        fecha_desde: lastStatus.fecha_hasta,
        fecha_hasta: new Date(),
        vehiculo,
      });

      return await this.statusUpdateRepository.save(newStatusUpdate);
    }

    // En la creación del vehículo no se crea StatusUpdate
    return null;
  }

  async obtenerUltimoStatus(idVehiculo: number): Promise<StatusUpdate | null> {
    return await this.statusUpdateRepository.findOne({
      where: {
        vehiculo: { id_vehiculo: idVehiculo },
      },
      order: { fecha_desde: 'DESC' },
    });
  }
}
