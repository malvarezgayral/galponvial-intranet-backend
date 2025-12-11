import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { VehiculoStatus } from './enums/vehiculo.enum';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(InfoAdicional)
    private readonly infoAdicionalRepository: Repository<InfoAdicional>,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    const { infoAdicional: infoData, ...vehiculoData } = createVehiculoDto;

    try {
      // Crear vehículo
      const vehiculo = this.vehiculoRepository.create(vehiculoData);
      const vehiculoGuardado = await this.vehiculoRepository.save(vehiculo);

      // Crear info adicional asociada
      const infoAdicional = this.infoAdicionalRepository.create({
        ...infoData,
        vehiculo: vehiculoGuardado,
      });
      await this.infoAdicionalRepository.save(infoAdicional);

      // Retornar vehículo con relaciones
      return await this.findOne(vehiculoGuardado.id_vehiculo);
    } catch (error) {
      throw new BadRequestException('Error al crear el vehículo: ' + error.message);
    }
  }

  async findAll(): Promise<Vehiculo[]> {
    return await this.vehiculoRepository.find({
      relations: ['infoAdicional', 'infoAdicional.sector'],
      order: { fecha_registro: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: id },
      relations: ['infoAdicional', 'infoAdicional.sector', 'statusUpdates', 'cargas', 'recordatorios'],
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehiculo;
  }

  async update(id: number, updateVehiculoDto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    Object.assign(vehiculo, updateVehiculoDto);

    try {
      await this.vehiculoRepository.save(vehiculo);
      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el vehículo: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    const vehiculo = await this.findOne(id);
    await this.vehiculoRepository.remove(vehiculo);
  }

  async cambiarStatus(id: number, nuevoStatus: VehiculoStatus): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.status = nuevoStatus;
    return await this.vehiculoRepository.save(vehiculo);
  }

  // Métodos de estadísticas
  async countByStatus(): Promise<any> {
    const disponibles = await this.vehiculoRepository.count({
      where: { status: VehiculoStatus.DISPONIBLE },
    });
    const enTaller = await this.vehiculoRepository.count({
      where: { status: VehiculoStatus.EN_TALLER },
    });
    const fueraServicio = await this.vehiculoRepository.count({
      where: { status: VehiculoStatus.FUERA_DE_SERVICIO },
    });

    return {
      disponibles,
      enTaller,
      fueraServicio,
      total: disponibles + enTaller + fueraServicio,
    };
  }
}
