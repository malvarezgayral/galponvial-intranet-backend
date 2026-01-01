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
  ): Promise<StatusUpdate> {
    const statusUpdate = this.statusUpdateRepository.create({
      tipo: nuevoStatus,
      fecha_desde: new Date(),
      fecha_hasta: new Date(), 
      vehiculo,
    });

    return await this.statusUpdateRepository.save(statusUpdate);
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