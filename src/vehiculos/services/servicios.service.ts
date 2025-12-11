import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../entities/servicio.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { CreateServicioDto } from '../dto/create-servicio.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(ReporteIncidente)
    private readonly incidenteRepository: Repository<ReporteIncidente>,
  ) {}

  async create(createDto: CreateServicioDto): Promise<Servicio> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: createDto.id_vehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    let incidente: ReporteIncidente | null = null;
    if (createDto.incidente_id) {
      incidente = await this.incidenteRepository.findOne({
        where: { id: createDto.incidente_id },
      });

      if (!incidente) {
        throw new NotFoundException('Incidente no encontrado');
      }
    }

    try {
      // Cambiar status del vehículo a EN_TALLER
      vehiculo.status = VehiculoStatus.EN_TALLER;
      await this.vehiculoRepository.save(vehiculo);

      // Crear servicio
      const servicio = this.servicioRepository.create({
        tipo: createDto.tipo,
        fecha_inicio: new Date(createDto.fecha_inicio),
        fecha_hasta: new Date(createDto.fecha_hasta),
        descripcion: createDto.descripcion,
        vehiculo,
        incidente,
      });

      return await this.servicioRepository.save(servicio);
    } catch (error) {
      throw new BadRequestException('Error al crear servicio: ' + error.message);
    }
  }

  async findAll(): Promise<Servicio[]> {
    return await this.servicioRepository.find({
      relations: ['vehiculo', 'incidente'],
      order: { fecha_inicio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'vehiculo.infoAdicional', 'incidente'],
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return servicio;
  }

  async findByVehiculo(idVehiculo: number): Promise<Servicio[]> {
    return await this.servicioRepository.find({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['incidente'],
      order: { fecha_inicio: 'DESC' },
    });
  }

  async finalizarServicio(id: number): Promise<Servicio> {
    const servicio = await this.findOne(id);
    const vehiculo = servicio.vehiculo;

    // Cambiar status del vehículo a DISPONIBLE
    vehiculo.status = VehiculoStatus.DISPONIBLE;
    await this.vehiculoRepository.save(vehiculo);

    // Actualizar fecha de finalización si corresponde
    servicio.fecha_hasta = new Date();
    return await this.servicioRepository.save(servicio);
  }

  async remove(id: number): Promise<void> {
    const servicio = await this.findOne(id);
    await this.servicioRepository.remove(servicio);
  }
}