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
import { VehiculoStatus} from '../enums/vehiculo.enum';
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
    // 1. Validar que el incidente existe (OBLIGATORIO)
    const incidente = await this.reporteIncidenteService.findOne(
      createServicioDto.incidente_id,
    );

    // 2. Obtener el vehículo desde el incidente
    const vehiculo = await this.vehiculosService.findOne(
      incidente.id_vehiculo,
    );

    try {
      // 3. Marcar incidente como "pendiente" (en proceso)
      await this.reporteIncidenteService.marcarEnTratamiento(
        createServicioDto.incidente_id,
      );

      // 4. Cambiar status del vehículo a EN_TALLER
      const statusViejo: VehiculoStatus = vehiculo.status;
      
      if (statusViejo !== VehiculoStatus.EN_TALLER) {
        await this.vehiculosService.updateStatus(
          vehiculo.id_vehiculo,
          VehiculoStatus.EN_TALLER,
        );
        
        // Crear registro de status update
        await this.statusUpdateService.crearStatusUpdate(vehiculo, statusViejo);
      }

      // 5. Crear el servicio
        const servicio = this.servicioRepository.create({
        tipo: createServicioDto.tipo,
        fecha_inicio: new Date(createServicioDto.fecha_inicio),
        fecha_hasta: createServicioDto.fecha_hasta
            ? new Date(createServicioDto.fecha_hasta)
            : null,
        descripcion: createServicioDto.descripcion,
        incidente_id: createServicioDto.incidente_id,
        incidente: incidente,
        })

      const servicioGuardado = await this.servicioRepository.save(servicio);

      // 6. Retornar servicio completo con relaciones
      const servicioCompleto = await this.servicioRepository.findOne({
        where: { id: servicioGuardado.id },
        relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      });

      if (!servicioCompleto) {
        throw new NotFoundException('Error al recuperar el servicio creado');
      }

      return servicioCompleto;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear servicio: ' + error.message,
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
          id_vehiculo: idVehiculo 
        } 
      },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
      order: { fecha_inicio: 'DESC' },
    });
  }
}