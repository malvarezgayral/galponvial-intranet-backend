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
    const lastStatus = await this.obtenerUltimoStatus(vehiculo.id_vehiculo);
    if (lastStatus) {
      lastStatus.fecha_hasta = new Date();
      await this.statusUpdateRepository.save(lastStatus);
    }

    const newStatusUpdate = this.statusUpdateRepository.create({
      tipo: nuevoStatus,
      fecha_desde: new Date(),
      vehiculo,
    });

    return await this.statusUpdateRepository.save(newStatusUpdate);
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