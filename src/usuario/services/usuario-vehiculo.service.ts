import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class UsuarioVehiculoService {
  constructor(
    @InjectRepository(UsuarioVehiculo)
    private readonly usuarioVehiculoRepository: Repository<UsuarioVehiculo>,
  ) {}

  /**
   * Obtiene el conductor vigente de un vehículo
   * (aquel que no tiene fecha_hasta)
   */
  async findConductorVigente(
    idVehiculo: number,
  ): Promise<UsuarioVehiculo | null> {
    const conductorVigente = await this.usuarioVehiculoRepository.findOne({
      where: {
        id_vehiculo: idVehiculo,
        fecha_hasta: IsNull(),
      },
      relations: ['usuario'],
      order: { fecha_desde: 'DESC' },
    });

    return conductorVigente;
  }

  async findConductorVigenteEnFecha(
  idVehiculo: number,
  fecha: Date,
): Promise<UsuarioVehiculo | null> {
  return await this.usuarioVehiculoRepository.findOne({
    where: {
      id_vehiculo: idVehiculo,
      fecha_desde: LessThanOrEqual(fecha),
    },
    relations: ['usuario'],
    order: { fecha_desde: 'DESC' },
  });
}
}
