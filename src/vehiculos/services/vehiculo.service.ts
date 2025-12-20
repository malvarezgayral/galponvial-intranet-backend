import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { InfoAdicional } from '../entities/info-adicional.entity';
import { Sector } from '../entities/sector.entity';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(InfoAdicional)
    private readonly infoAdicionalRepository: Repository<InfoAdicional>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    const { infoAdicional: infoData, ...vehiculoData } = createVehiculoDto;

    // Validar que el sector exista si se proporciona
    if (infoData.id_sector_pertenencia) {
      const sector = await this.sectorRepository.findOne({
        where: { id_sector: infoData.id_sector_pertenencia },
      });

      if (!sector) {
        throw new NotFoundException(
          `Sector con ID ${infoData.id_sector_pertenencia} no encontrado`,
        );
      }
    }

    try {
      // 1. Crear vehículo con status inicial DISPONIBLE
      const vehiculo = this.vehiculoRepository.create({
        ...vehiculoData,
        status: VehiculoStatus.DISPONIBLE,
        uso_km: vehiculoData.uso_km || 0,
        uso_combustible: vehiculoData.uso_combustible || 0,
      });

      const vehiculoGuardado = await this.vehiculoRepository.save(vehiculo);

      // 2. Crear info adicional asociada
      const infoAdicional = this.infoAdicionalRepository.create({
        ...infoData,
        vehiculo: vehiculoGuardado,
      });
      await this.infoAdicionalRepository.save(infoAdicional);

      // 3. Retornar vehículo completo con relaciones
      const vehiculoCompleto = await this.vehiculoRepository.findOne({
        where: { id_vehiculo: vehiculoGuardado.id_vehiculo },
        relations: ['infoAdicional', 'infoAdicional.sector'],
      });

      if (!vehiculoCompleto) {
        throw new NotFoundException('Error al recuperar el vehículo creado');
      }

      return vehiculoCompleto;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear el vehículo: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateVehiculoDto: UpdateVehiculoDto,
  ): Promise<Vehiculo> {
    // 1. Buscar vehículo existente
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: id },
      relations: ['infoAdicional'],
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    const { infoAdicional: infoData, ...vehiculoData } = updateVehiculoDto;

    // 2. Validar sector si se está actualizando
    if (infoData?.id_sector_pertenencia) {
      const sector = await this.sectorRepository.findOne({
        where: { id_sector: infoData.id_sector_pertenencia },
      });

      if (!sector) {
        throw new NotFoundException(
          `Sector con ID ${infoData.id_sector_pertenencia} no encontrado`,
        );
      }
    }

    try {
      // 3. Actualizar datos del vehículo
      Object.assign(vehiculo, vehiculoData);
      await this.vehiculoRepository.save(vehiculo);

      // 4. Actualizar info adicional si se proporcionó
      if (infoData && vehiculo.infoAdicional) {
        Object.assign(vehiculo.infoAdicional, infoData);
        await this.infoAdicionalRepository.save(vehiculo.infoAdicional);
      }

      // 5. Retornar vehículo actualizado con relaciones
      const vehiculoActualizado = await this.vehiculoRepository.findOne({
        where: { id_vehiculo: id },
        relations: ['infoAdicional', 'infoAdicional.sector'],
      });

      if (!vehiculoActualizado) {
        throw new NotFoundException('Error al recuperar el vehículo actualizado');
      }

      return vehiculoActualizado;
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar el vehículo: ' + error.message,
      );
    }
  }
}
