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
import { CreateInfoAdicionalDataDto } from '../dto/create-info-adicional-data.dto';

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
    const { infoAdicional, ...vehiculoData } = createVehiculoDto;

    // Validar y obtener el sector si se proporciona
    let sector: Sector | undefined;
    if (infoAdicional.id_sector_pertenencia) {
      const foundSector = await this.sectorRepository.findOne({
        where: { id_sector: infoAdicional.id_sector_pertenencia },
      });

      if (!foundSector) {
        throw new NotFoundException(
          `Sector con ID ${infoAdicional.id_sector_pertenencia} no encontrado`,
        );
      }
      sector = foundSector;
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

      // info adicional creada, se usa deep partial para hacer mas permisivo el create
      const infoData: Partial<CreateInfoAdicionalDataDto> = {
        numero_serie: infoAdicional.numero_serie,
        licencia_conductor: infoAdicional.licencia_conductor,
        color: infoAdicional.color,
        seguro_empresa: infoAdicional.seguro_empresa,
        poliza: infoAdicional.poliza,
        vehiculo: vehiculoGuardado,
      };

      // solo se asigna sector en caso que exista
      if (sector) {
        infoData.sector = sector;
      }

      const infoAdicionalCreated =
        this.infoAdicionalRepository.create(infoData);
      await this.infoAdicionalRepository.save(infoAdicionalCreated);

      // 3. Retornar vehículo completo con relaciones
      const vehiculoCompleto = await this.vehiculoRepository.findOne({
        where: { id_vehiculo: vehiculoGuardado.id_vehiculo },
        relations: ['infoAdicional', 'infoAdicional.sector'],
      });

      if (!vehiculoCompleto) {
        throw new NotFoundException('Error al recuperar el vehículo creado');
      }

      return vehiculoCompleto; // ← ESTE ES EL RETURN QUE FALTABA
    } catch (error) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      Object.assign(vehiculo, vehiculoData);
      await this.vehiculoRepository.save(vehiculo);

      if (infoData && vehiculo.infoAdicional) {
        Object.assign(vehiculo.infoAdicional, infoData);
        await this.infoAdicionalRepository.save(vehiculo.infoAdicional);
      }

      const vehiculoActualizado = await this.vehiculoRepository.findOne({
        where: { id_vehiculo: id },
        relations: ['infoAdicional', 'infoAdicional.sector'],
      });

      if (!vehiculoActualizado) {
        throw new NotFoundException(
          'Error al recuperar el vehículo actualizado',
        );
      }

      return vehiculoActualizado;
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar el vehículo: ' + error.message,
      );
    }
  }


  async updateStatus(
    idVehiculo: number,
    nuevoStatus: VehiculoStatus,
  ): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${idVehiculo} no encontrado`,
      );
    }

    vehiculo.status = nuevoStatus;
    return await this.vehiculoRepository.save(vehiculo);
  }

  async findOne(
    idVehiculo: number
  ): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${idVehiculo} no encontrado`,
      );
    }

    return vehiculo;
  }
}