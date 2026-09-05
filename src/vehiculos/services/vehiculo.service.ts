/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { InfoAdicional } from '../entities/info-adicional.entity';
import { Sector } from '../entities/sector.entity';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';
import { CreateInfoAdicionalDataDto } from '../dto/create-info-adicional-data.dto';
import { DeleteLogicoVehiculoDto } from '../dto/delete-logico-vehiculo.dto';
import { StatusUpdateService } from './status-update.service';
import { StatusUpdate } from '../entities/status-update.entity';
import { CombustibleCarga } from '../entities/combustible-carga.entity';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';
import { UsuarioMinimalResponseDto } from 'src/usuario/dto/usuario-response.dto';
import { UsuarioVehiculo } from 'src/usuario/entities/usuario-vehiculo.entity';

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
    @InjectRepository(UsuarioVehiculo)
    private readonly usuarioVehiculoRepository: Repository<UsuarioVehiculo>,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  private filterUsuarioMinimal(usuario: any): UsuarioMinimalResponseDto | null {
    if (!usuario) return null;
    return {
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    };
  }

  private filterReporteIncidenteResponse(
    incidente: any,
  ): ReporteIncidenteResponseDto | null {
    if (!incidente) return null;
    return {
      id: incidente.id,
      fecha: incidente.fecha,
      tipo: incidente.tipo,
      descripcion: incidente.descripcion,
      falla: incidente.falla,
      estado: incidente.estado,
      id_vehiculo: incidente.id_vehiculo,
      usuario: incidente.usuario
        ? this.filterUsuarioMinimal(incidente.usuario) || undefined
        : undefined,
      vehiculo: incidente.vehiculo,
      servicios: incidente.servicios,
    };
  }

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
      const vehiculo = this.vehiculoRepository.create(vehiculoData);
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

      const infoAdicionalCreated = this.infoAdicionalRepository.create(infoData);
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
        throw new NotFoundException('Error al recuperar el vehículo actualizado');
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
      throw new NotFoundException(`Vehículo con ID ${idVehiculo} no encontrado`);
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
      throw new NotFoundException(`Vehículo con ID ${idVehiculo} no encontrado`);
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
      throw new NotFoundException(`Vehículo con ID ${idVehiculo} no encontrado`);
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

    await this.statusUpdateService.crearStatusUpdate(vehiculoActualizado, statusViejo);

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

    await this.statusUpdateService.crearStatusUpdate(vehiculoActualizado, statusViejo);

    return vehiculoActualizado;
  }

  async softDelete(
    idVehiculo: number,
    dto: DeleteLogicoVehiculoDto,
  ): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
      relations: ['infoAdicional', 'infoAdicional.sector'],
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${idVehiculo} no encontrado`);
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
    data: ReporteIncidenteResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    await this.findOne(idVehiculo);

    const [data, total] = await this.reporteIncidenteRepository.findAndCount({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['usuario', 'vehiculo', 'servicios'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha: 'DESC' },
    });

    return {
      data: data
        .map((incidente) => this.filterReporteIncidenteResponse(incidente))
        .filter((i) => i !== null),
      total,
      page,
      pageSize,
    };
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
  ): Promise<ReporteIncidenteResponseDto> {
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
      await this.updateStatus(vehiculo.id_vehiculo, VehiculoStatus.FUERA_DE_SERVICIO);
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

    const incidenteGuardado = await this.reporteIncidenteRepository.save(incidente);

    const incidenteCompleto = await this.reporteIncidenteRepository.findOne({
      where: { id: incidenteGuardado.id },
      relations: ['vehiculo', 'usuario', 'servicios'],
    });

    return this.filterReporteIncidenteResponse(incidenteCompleto) as ReporteIncidenteResponseDto;
  }

  async agregarCombustibleCarga(
    idVehiculo: number,
    data: CreateCombustibleCargaDto,
  ): Promise<CombustibleCarga> {
    const vehiculo = await this.findOne(idVehiculo);

    const carga = new CombustibleCarga();
    carga.fecha_carga = new Date(data.fecha_carga);
    carga.despachante = data.despachante || '';
    carga.tipo_combustible = data.tipo_combustible;
    carga.Galpón_Vial = data.Galpón_Vial;
    carga.km_actual = data.km_actual;
    carga.cant_combustible_despachado = data.cant_combustible_despachado;
    carga.chofer = data.chofer;
    carga.estacion_servicio = data.estacion_servicio;
    carga.litros_entrada = data.litros_entrada;
    carga.litros_salida = data.litros_salida;
    carga.estado_parcial = data.estado_parcial;
    carga.vehiculo = vehiculo;

    vehiculo.uso_combustible += data.cant_combustible_despachado;
    vehiculo.uso_km = data.km_actual;

    await this.vehiculoRepository.save(vehiculo);

    return await this.combustibleCargaRepository.save(carga);
  }

  async assignVehicleToUser(
    dni: number,
    idVehiculo: number,
  ): Promise<UsuarioVehiculo> {
    const usuario = await this.usuarioRepository.findOne({
      where: { dni },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con DNI ${dni} no encontrado`);
    }

    if (!usuario.isActive) {
      throw new BadRequestException('El usuario no está activo');
    }

    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: idVehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${idVehiculo} no encontrado`);
    }

    if (
      vehiculo.status === VehiculoStatus.EN_TALLER ||
      vehiculo.status === VehiculoStatus.FUERA_DE_SERVICIO
    ) {
      throw new BadRequestException(
        `El vehículo no puede ser asignado porque está en estado: ${vehiculo.status}`,
      );
    }

    const relacionExistente = await this.usuarioVehiculoRepository.findOne({
      where: {
        id_usuario: usuario.dni,
        id_vehiculo: idVehiculo,
        fecha_hasta: IsNull(),
      },
    });

    if (relacionExistente) {
      throw new BadRequestException('Vehículo y usuario ya están relacionados');
    }

    const nuevaRelacion = new UsuarioVehiculo();
    nuevaRelacion.id_usuario = usuario.dni;
    nuevaRelacion.id_vehiculo = idVehiculo;
    nuevaRelacion.fecha_desde = new Date();
    nuevaRelacion.fecha_hasta = null;
    nuevaRelacion.usuario = usuario;
    nuevaRelacion.vehiculo = vehiculo;

    return await this.usuarioVehiculoRepository.save(nuevaRelacion);
  }

  async getAllUsuarioVehiculo(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: UsuarioVehiculo[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const [data, total] = await this.usuarioVehiculoRepository.findAndCount({
      relations: ['usuario', 'vehiculo'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id_usuario_vehiculo: 'DESC' },
    });

    return { data, total, page, pageSize };
  }

  async unassignVehicleFromUser(
    idUsuarioVehiculo: number,
  ): Promise<UsuarioVehiculo> {
    const relacion = await this.usuarioVehiculoRepository.findOne({
      where: { id_usuario_vehiculo: idUsuarioVehiculo },
      relations: ['usuario', 'vehiculo'],
    });

    if (!relacion) {
      throw new NotFoundException(
        `Relación usuario-vehículo con ID ${idUsuarioVehiculo} no encontrada`,
      );
    }

    if (relacion.fecha_hasta !== null) {
      throw new BadRequestException(
        'La relación usuario-vehículo ya ha sido desasignada',
      );
    }

    relacion.fecha_hasta = new Date();

    return await this.usuarioVehiculoRepository.save(relacion);
  }

  async getAllSectores(): Promise<string[]> {
    const sectores = await this.sectorRepository.find();
    return sectores.map((sector) => sector.nombre);
  }
}
