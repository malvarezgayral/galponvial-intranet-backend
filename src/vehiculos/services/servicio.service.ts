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
import { VehiculoStatus } from '../enums/vehiculo.enum';
import { StatusUpdateService } from './status-update.service';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    private readonly vehiculosService: VehiculosService,
    private readonly reporteIncidenteService: ReporteIncidenteService,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
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

        // Marcar incidente como "en tratamiento"
        await this.reporteIncidenteService.marcarEnTratamiento(
          createServicioDto.incidente_id,
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
      const servicioData: any = {
        tipo: createServicioDto.tipo,
        fecha_inicio: new Date(createServicioDto.fecha_inicio),
        fecha_hasta: createServicioDto.fecha_hasta
          ? new Date(createServicioDto.fecha_hasta)
          : null,
        descripcion: createServicioDto.descripcion,
        incidente_id: createServicioDto.incidente_id || null,
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

      return servicioCompleto;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear servicio: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      );
    }
  }

  async findAll(): Promise<Servicio[]> {
    return await this.servicioRepository.find({
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.findOne({
      where: { id },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return servicio;
  }

  async findByIncidente(idIncidente: number): Promise<Servicio[]> {
    await this.reporteIncidenteService.findOne(idIncidente);

    return await this.servicioRepository.find({
      where: { incidente_id: idIncidente },
      relations: ['incidente', 'incidente.vehiculo'],
      order: { fecha_inicio: 'DESC' },
    });
  }

  async findByVehiculo(idVehiculo: number): Promise<Servicio[]> {
    await this.vehiculosService.findOne(idVehiculo);

    return await this.servicioRepository.find({
      where: {
        incidente: {
          id_vehiculo: idVehiculo,
        },
      },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
  }
}
