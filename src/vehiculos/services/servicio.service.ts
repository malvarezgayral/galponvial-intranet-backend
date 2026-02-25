/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from 'src/usuario/entities/servicio.entity';
import { CreateServicioDto } from '../dto/create-servicio.dto';
import { ReporteIncidenteService } from './reporte-incidente.service';
import { VehiculosService } from './vehiculo.service';
import { VehiculoStatus, StatusIncidente } from '../enums/vehiculo.enum';
import { StatusUpdateService } from './status-update.service';
import { ServicioResponseDto } from '../dto/servicio-response.dto';
import { UsuarioMinimalResponseDto } from 'src/usuario/dto/usuario-response.dto';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    private readonly vehiculosService: VehiculosService,
    private readonly reporteIncidenteService: ReporteIncidenteService,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  // ===== MÉTODOS HELPER PARA FILTRADO DE DATOS SENSIBLES =====

  /**
   * Filtra ReporteIncidente para devolver sin datos sensibles
   */
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
        ? (this.filterUsuarioMinimal(
            incidente.usuario,
          ) as UsuarioMinimalResponseDto)
        : undefined,
      vehiculo: incidente.vehiculo,
      servicios: incidente.servicios,
    };
  }

  /**
   * Filtra un Usuario para devolver información mínima
   */
  private filterUsuarioMinimal(usuario: any): UsuarioMinimalResponseDto | null {
    if (!usuario) return null;
    return {
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    };
  }

  /**
   * Filtra Servicio para devolver sin datos sensibles en relaciones
   */
  private filterServicioResponse(servicio: any): ServicioResponseDto | null {
    if (!servicio) return null;
    return {
      id: servicio.id,
      tipo: servicio.tipo,
      fecha_inicio: servicio.fecha_inicio,
      fecha_hasta: servicio.fecha_hasta,
      descripcion: servicio.descripcion,
      incidente_id: servicio.incidente_id,
      incidente: servicio.incidente
        ? this.filterReporteIncidenteResponse(servicio.incidente)
        : undefined,
    };
  }

  /**
   * Filtra un array de Servicio
   */
  private filterServiciosResponse(servicios: any[]): ServicioResponseDto[] {
    if (!servicios || servicios.length === 0) return [];
    return servicios
      .map((s) => this.filterServicioResponse(s))
      .filter((s) => s !== null);
  }

  async create(
    createServicioDto: CreateServicioDto,
  ): Promise<ServicioResponseDto> {
    // Obtener el vehículo según si hay incidente o no
    let vehiculo;
    let incidente;

    try {
      // Caso 1: Si hay incidente, obtener vehículo desde el incidente
      if (createServicioDto.incidente_id) {
        incidente = await this.reporteIncidenteService.findOne(
          createServicioDto.incidente_id,
        );
        if (incidente) {
          vehiculo = await this.vehiculosService.findOne(incidente.id_vehiculo);
        }

        // Marcar incidente como "en tratamiento" (PENDIENTE)
        await this.reporteIncidenteService.actualizarEstadoIncidente(
          createServicioDto.incidente_id,
          StatusIncidente.PENDIENTE,
        );
      }
      // Caso 2: Si no hay incidente, usar id_vehiculo directamente
      else {
        if (!createServicioDto.id_vehiculo) {
          throw new BadRequestException(
            'Debe proporcionar id_vehiculo si no está asociado a un incidente',
          );
        }
        vehiculo = await this.vehiculosService.findOne(
          createServicioDto.id_vehiculo,
        );
      }

      // Cambiar status del vehículo a EN_TALLER
      const statusViejo: VehiculoStatus = vehiculo.status;

      if (statusViejo !== VehiculoStatus.EN_TALLER) {
        await this.vehiculosService.updateStatus(
          vehiculo.id_vehiculo,
          VehiculoStatus.EN_TALLER,
        );

        // Crear registro de status update
        await this.statusUpdateService.crearStatusUpdate(vehiculo, statusViejo);
      }

      // Crear el servicio
      const servicioData: Partial<Servicio> = {
        tipo: createServicioDto.tipo,
        fecha_inicio: new Date(createServicioDto.fecha_inicio),
        fecha_hasta: createServicioDto.fecha_hasta
          ? new Date(createServicioDto.fecha_hasta)
          : null,
        descripcion: createServicioDto.descripcion,
        incidente_id: createServicioDto?.incidente_id,
      };

      if (incidente) {
        servicioData.incidente = incidente;
      }

      const servicio = this.servicioRepository.create(servicioData);

      const servicioGuardado: unknown =
        await this.servicioRepository.save(servicio);

      // Retornar servicio completo con relaciones (si tiene incidente)
      const servicioCompleto = await this.servicioRepository.findOne({
        where: { id: (servicioGuardado as Servicio).id },
        relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      });

      if (!servicioCompleto) {
        throw new NotFoundException('Error al recuperar el servicio creado');
      }

      return this.filterServicioResponse(
        servicioCompleto,
      ) as ServicioResponseDto;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear servicio: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      );
    }
  }

  async findAll(): Promise<ServicioResponseDto[]> {
    const servicios = await this.servicioRepository.find({
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
    return this.filterServiciosResponse(servicios);
  }

  async findOne(id: number): Promise<ServicioResponseDto> {
    const servicio = await this.servicioRepository.findOne({
      where: { id },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return this.filterServicioResponse(servicio) as ServicioResponseDto;
  }

  async findByIncidente(idIncidente: number): Promise<ServicioResponseDto[]> {
    await this.reporteIncidenteService.findOne(idIncidente);

    const servicios = await this.servicioRepository.find({
      where: { incidente_id: idIncidente },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
    return this.filterServiciosResponse(servicios);
  }

  async findByVehiculo(idVehiculo: number): Promise<ServicioResponseDto[]> {
    await this.vehiculosService.findOne(idVehiculo);

    const servicios = await this.servicioRepository.find({
      where: {
        incidente: {
          id_vehiculo: idVehiculo,
        },
      },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
    return this.filterServiciosResponse(servicios);
  }
}
