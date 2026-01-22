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
import { StatusUpdateService } from './status-update.service';
import { Recordatorio } from '../entities/recordatorio.entity';
import { CreateRecordatorioDto } from '../dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from '../dto/update-recordatorio.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(InfoAdicional)
    private readonly infoAdicionalRepository: Repository<InfoAdicional>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    private readonly statusUpdateService: StatusUpdateService,
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    const { infoAdicional, ...vehiculoData } = createVehiculoDto;

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
      const vehiculo = this.vehiculoRepository.create({
        ...vehiculoData,
        status: VehiculoStatus.DISPONIBLE,
        uso_km: vehiculoData.uso_km || 0,
        uso_combustible: vehiculoData.uso_combustible || 0,
      });

      const vehiculoGuardado = await this.vehiculoRepository.save(vehiculo);

      const infoData: Partial<CreateInfoAdicionalDataDto> = {
        numero_serie: infoAdicional.numero_serie,
        licencia_conductor: infoAdicional.licencia_conductor,
        color: infoAdicional.color,
        seguro_empresa: infoAdicional.seguro_empresa,
        poliza: infoAdicional.poliza,
        vehiculo: vehiculoGuardado,
      };

      if (sector) {
        infoData.sector = sector;
      }

      const infoAdicionalCreated =
        this.infoAdicionalRepository.create(infoData);
      await this.infoAdicionalRepository.save(infoAdicionalCreated);

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
        'Error al crear el vehículo: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      );
    }
  }

  async update(
    id: number,
    updateVehiculoDto: UpdateVehiculoDto,
  ): Promise<Vehiculo> {
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
        'Error al actualizar el vehículo: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
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

  async findAll(): Promise<Vehiculo[]> {
    return await this.vehiculoRepository.find({
      relations: ['infoAdicional', 'infoAdicional.sector'],
      order: { id_vehiculo: 'ASC' },
    });
  }

  async findOne(idVehiculo: number): Promise<Vehiculo> {
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

  async cambiarStatus(
    idVehiculo: number,
    isActive: boolean,
  ): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${idVehiculo} no encontrado`,
      );
    }

    const nuevoStatus = isActive
      ? VehiculoStatus.DISPONIBLE
      : VehiculoStatus.FUERA_DE_SERVICIO;

    if (vehiculo.status === nuevoStatus) {
      const accion = isActive ? 'dado de alta' : 'dado de baja';
      throw new BadRequestException(
        `El vehículo con ID ${idVehiculo} ya está ${accion}`,
      );
    }
    const statusViejo: VehiculoStatus = vehiculo.status;
    vehiculo.status = nuevoStatus;
    const vehiculoActualizado = await this.vehiculoRepository.save(vehiculo);

    await this.statusUpdateService.crearStatusUpdate(
      vehiculoActualizado,
      statusViejo,
    );

    return vehiculoActualizado;
  }

  async agregarRecordatorio(
    idVehiculo: number,
    data: CreateRecordatorioDto,
  ): Promise<Recordatorio> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${idVehiculo} no encontrado`,
      );
    }

    const recordatorio = this.recordatorioRepository.create({
      fecha: data.fecha,
      descripcion: data.descripcion,
      vehiculo,
    });

    return await this.recordatorioRepository.save(recordatorio);
  }

  async getRecordatoriosByVehiculo(
    vehiculoId: number,
  ): Promise<Recordatorio[]> {
    return this.recordatorioRepository.find({
      where: {
        vehiculo: { id_vehiculo: vehiculoId },
      },
      order: {
        fecha: 'ASC',
      },
    });
  }

  async updateRecordatorio(
    recordatorioId: number,
    data: UpdateRecordatorioDto,
  ): Promise<Recordatorio> {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id: recordatorioId },
    });

    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    if (data.fecha !== undefined) {
      recordatorio.fecha = new Date(data.fecha);
    }

    if (data.descripcion !== undefined) {
      recordatorio.descripcion = data.descripcion;
    }

    return this.recordatorioRepository.save(recordatorio);
  }
}
