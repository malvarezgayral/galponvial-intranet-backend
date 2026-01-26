/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { DeleteLogicoVehiculoDto } from '../dto/delete-logico-vehiculo.dto';
import { StatusUpdateService } from './status-update.service';
import { Recordatorio } from '../entities/recordatorio.entity';
import { CreateRecordatorioDto } from '../dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from '../dto/update-recordatorio.dto';
import { StatusUpdate } from '../entities/status-update.entity';
import { CombustibleCarga } from '../entities/combustible-carga.entity';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(InfoAdicional)
    private readonly infoAdicionalRepository: Repository<InfoAdicional>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(StatusUpdate)
    private readonly statusUpdateRepository: Repository<StatusUpdate>,
    @InjectRepository(CombustibleCarga)
    private readonly combustibleCargaRepository: Repository<CombustibleCarga>,
    @InjectRepository(ReporteIncidente)
    private readonly reporteIncidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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
      where: { id_vehiculo: id, eliminado: false },
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
      where: { id_vehiculo: idVehiculo, eliminado: false },
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
      where: { eliminado: false },
      relations: ['infoAdicional', 'infoAdicional.sector'],
      order: { id_vehiculo: 'ASC' },
    });
  }

  async findOne(idVehiculo: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo, eliminado: false },
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
      where: { id_vehiculo: idVehiculo, eliminado: false },
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

  async updateVehiculoStatusConHistorico(
    idVehiculo: number,
    nuevoStatus: string,
  ): Promise<Vehiculo> {
    const vehiculo = await this.findOne(idVehiculo);

    const statusValido = Object.values(VehiculoStatus).includes(
      nuevoStatus as VehiculoStatus,
    );
    if (!statusValido) {
      throw new BadRequestException(
        `Status '${nuevoStatus}' no válido. Valores permitidos: ${Object.values(VehiculoStatus).join(', ')}`,
      );
    }

    const statusViejo = vehiculo.status;
    vehiculo.status = nuevoStatus as VehiculoStatus;

    const vehiculoActualizado = await this.vehiculoRepository.save(vehiculo);

    // Guardar el status anterior en el histórico
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
      where: { id_vehiculo: idVehiculo, eliminado: false },
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

  async softDelete(
    idVehiculo: number,
    dto: DeleteLogicoVehiculoDto,
  ): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo, eliminado: false },
      relations: ['infoAdicional', 'infoAdicional.sector'],
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${idVehiculo} no encontrado`,
      );
    }

    if (dto.eliminado === vehiculo.eliminado) {
      const estado = vehiculo.eliminado ? 'eliminado' : 'activo';
      throw new BadRequestException(
        `El vehículo con ID ${idVehiculo} ya está ${estado}`,
      );
    }

    vehiculo.eliminado = dto.eliminado;
    return await this.vehiculoRepository.save(vehiculo);
  }

  async getStatusUpdatesPaginado(
    idVehiculo: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: StatusUpdate[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Validar que el vehículo existe
    await this.findOne(idVehiculo);

    const [data, total] = await this.statusUpdateRepository.findAndCount({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['vehiculo'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha_desde: 'DESC' },
    });

    return { data, total, page, pageSize };
  }

  async getIncidentesPaginado(
    idVehiculo: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: ReporteIncidente[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Validar que el vehículo existe
    await this.findOne(idVehiculo);

    const [data, total] = await this.reporteIncidenteRepository.findAndCount({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['usuario', 'vehiculo'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha: 'DESC' },
    });

    return { data, total, page, pageSize };
  }

  async getRecordatoriosPaginado(
    idVehiculo: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: Recordatorio[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Validar que el vehículo existe
    await this.findOne(idVehiculo);

    const [data, total] = await this.recordatorioRepository.findAndCount({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['vehiculo'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha: 'ASC' },
    });

    return { data, total, page, pageSize };
  }

  async getCombustibleCargasPaginado(
    idVehiculo: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: CombustibleCarga[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Validar que el vehículo existe
    await this.findOne(idVehiculo);

    const [data, total] = await this.combustibleCargaRepository.findAndCount({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['vehiculo'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha_carga: 'DESC' },
    });

    return { data, total, page, pageSize };
  }

  async agregarIncidente(
    idVehiculo: number,
    data: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    const vehiculo = await this.findOne(idVehiculo);

    const usuarioReportante = await this.usuarioRepository.findOne({
      where: { dni: data.id_usuario },
    });

    if (!usuarioReportante) {
      throw new NotFoundException(
        `Usuario con DNI ${data.id_usuario} no encontrado`,
      );
    }

    if (data.falla === FallaIncidente.CRITICA) {
      const statusViejo: VehiculoStatus = vehiculo.status;
      await this.updateStatus(
        vehiculo.id_vehiculo,
        VehiculoStatus.FUERA_DE_SERVICIO,
      );
      await this.statusUpdateService.crearStatusUpdate(vehiculo, statusViejo);
    }

    const incidente = new ReporteIncidente();
    incidente.fecha = new Date(data.fecha);
    incidente.tipo = data.tipo;
    incidente.descripcion = data.descripcion;
    incidente.falla = data.falla;
    incidente.vehiculo = vehiculo;
    incidente.usuario = usuarioReportante;
    incidente.id_usuario = usuarioReportante.dni;

    return await this.reporteIncidenteRepository.save(incidente);
  }

  async agregarCombustibleCarga(
    idVehiculo: number,
    data: CreateCombustibleCargaDto,
  ): Promise<CombustibleCarga> {
    const vehiculo = await this.findOne(idVehiculo);

    const carga = new CombustibleCarga();
    carga.fecha_carga = new Date(data.fecha_carga);
    carga.despachante = data.despachante || '';
    carga.km_actual = data.km_actual;
    carga.cant_combustible_despachado = data.cant_combustible_despachado;
    carga.vehiculo = vehiculo;

    return await this.combustibleCargaRepository.save(carga);
  }
}
