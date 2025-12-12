import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm'; // ← AGREGAR IsNull
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { StatusUpdate } from '../entities/status-update.entity';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { VehiculoStatus, CriticidadIncidente } from '../enums/vehiculo.enum';

@Injectable()
export class IncidentesService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly incidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(StatusUpdate)
    private readonly statusUpdateRepository: Repository<StatusUpdate>,
  ) {}

  async create(createDto: CreateIncidenteDto): Promise<ReporteIncidente> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: createDto.id_vehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    try {
      // Crear incidente
      const incidente = this.incidenteRepository.create({
        fecha: new Date(createDto.fecha),
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        falla: createDto.falla,
        vehiculo,
      });

      const incidenteGuardado = await this.incidenteRepository.save(incidente);

      // Cambiar status automáticamente si es crítico o si se solicita
      const deberaCambiarStatus = 
        createDto.falla === CriticidadIncidente.CRITICA || 
        createDto.cambiar_status_vehiculo === true;

      if (deberaCambiarStatus) {
        await this.cambiarStatusVehiculo(vehiculo, VehiculoStatus.FUERA_DE_SERVICIO);
      }

      return incidenteGuardado;
    } catch (error) {
      throw new BadRequestException('Error al crear incidente: ' + error.message);
    }
  }

 private async cambiarStatusVehiculo(vehiculo: Vehiculo, nuevoStatus: VehiculoStatus): Promise<void> {
    // Cerrar el status anterior si existe
    const statusAnterior = await this.statusUpdateRepository.findOne({
      where: { 
        vehiculo: { id_vehiculo: vehiculo.id_vehiculo },
        fecha_hasta: IsNull() // ← CAMBIAR de null a IsNull()
      },
      order: { fecha_desde: 'DESC' }
    });

    if (statusAnterior) {
      statusAnterior.fecha_hasta = new Date();
      await this.statusUpdateRepository.save(statusAnterior);
    }

    // Actualizar status del vehículo
    vehiculo.status = nuevoStatus;
    await this.vehiculoRepository.save(vehiculo);

    // Crear nuevo registro de cambio de status
    const statusUpdate = this.statusUpdateRepository.create({
      tipo: nuevoStatus,
      fecha_desde: new Date(),
      fecha_hasta: null,
      vehiculo,
    });

    await this.statusUpdateRepository.save(statusUpdate);
  }


  async findAll(filtros: FiltrosIncidenteDto): Promise<ReporteIncidente[]> {
    const where: any = {};

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha = Between(new Date(filtros.fecha_desde), new Date(filtros.fecha_hasta));
    }

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.importancia) {
      where.falla = filtros.importancia;
    }

    return await this.incidenteRepository.find({
      where,
      relations: ['vehiculo'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ReporteIncidente> {
    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'vehiculo.infoAdicional'],
    });

    if (!incidente) {
      throw new NotFoundException('Incidente no encontrado');
    }

    return incidente;
  }

  async actualizarStatus(id: number, nuevoStatus: any): Promise<ReporteIncidente> {
    const incidente = await this.findOne(id);
    incidente.status = nuevoStatus;
    return await this.incidenteRepository.save(incidente);
  }
}