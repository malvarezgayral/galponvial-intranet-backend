import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { FiltrosIncidenteDto } from '../dto/filtros.dto'; 
import { VehiculoStatus, StatusIncidente } from '../enums/vehiculo.enum';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';
import { StatusUpdateService } from './status-update.service';
import { VehiculosService } from './vehiculo.service';
import { UsuarioVehiculoService } from 'src/usuario/services/usuario-vehiculo.service';

@Injectable()
export class ReporteIncidenteService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly reporteIncidenteRepository: Repository<ReporteIncidente>,
    private readonly vehiculosService: VehiculosService,
    private readonly usuarioVehiculoService: UsuarioVehiculoService,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  async create(
    createDto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    // 1. Obtener vehículo usando el servicio
    const vehiculo = await this.vehiculosService.findOne(createDto.id_vehiculo);

    // 2. Obtener conductor vigente del vehículo
    const conductorVigente =
      await this.usuarioVehiculoService.findConductorVigente(
        createDto.id_vehiculo,
      );

    if (!conductorVigente) {
      throw new BadRequestException(
        `No hay conductor asignado vigente para el vehículo ID ${createDto.id_vehiculo}`,
      );
    }

    try {
      // 3. Crear reporte de incidente (con el usuario del vehículo)
      const reporte = this.reporteIncidenteRepository.create({
        fecha: new Date(createDto.fecha),
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        falla: createDto.falla,
        id_vehiculo: createDto.id_vehiculo,
        id_usuario: conductorVigente.id_usuario,
        vehiculo,
        usuario: conductorVigente.usuario,
      });

      const reporteGuardado =
        await this.reporteIncidenteRepository.save(reporte);

      // 4. Si la falla es CRÍTICA, cambiar status del vehículo
      if (createDto.falla === FallaIncidente.CRITICA) {
        const statusViejo: VehiculoStatus = vehiculo.status;
        await this.vehiculosService.updateStatus(
          vehiculo.id_vehiculo,
          VehiculoStatus.FUERA_DE_SERVICIO,
        );
        await this.statusUpdateService.crearStatusUpdate(vehiculo, statusViejo);
      }

      // 5. Retornar con relaciones
      const reporteCompleto = await this.reporteIncidenteRepository.findOne({
        where: { id: reporteGuardado.id },
        relations: ['vehiculo', 'usuario'],
      });

      if (!reporteCompleto) {
        throw new NotFoundException('Error al recuperar el reporte creado');
      }

      return reporteCompleto;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear reporte de incidente: ' + error.message,
      );
    }
  }

  async findAll(filtros?: FiltrosIncidenteDto): Promise<ReporteIncidente[]> {
    const where: FindOptionsWhere<ReporteIncidente> = {};

    // Aplicar filtros si existen
    if (filtros) {
      // Filtro por rango de fechas
      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha = Between(
          new Date(filtros.fecha_desde),
          new Date(filtros.fecha_hasta),
        );
      }

      // Filtro por status
      if (filtros.status) {
        where.estado = filtros.status;
      }

      // Filtro por importancia/falla
      if (filtros.importancia) {
        where.falla = filtros.importancia;
      }
    }

    return await this.reporteIncidenteRepository.find({
      where,
      relations: ['vehiculo', 'usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ReporteIncidente> {
    const incidente = await this.reporteIncidenteRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'usuario', 'servicios'],
    });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    return incidente;
  }

  async marcarEnTratamiento(id: number): Promise<ReporteIncidente> {
  const incidente = await this.reporteIncidenteRepository.findOne({
    where: { id },
  });

  if (!incidente) {
    throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
  }

  // Mantener como PENDIENTE (está en tratamiento pero no resuelto)
  incidente.estado = StatusIncidente.PENDIENTE;

  return await this.reporteIncidenteRepository.save(incidente);
}

async marcarResuelto(id: number): Promise<ReporteIncidente> {
  const incidente = await this.reporteIncidenteRepository.findOne({
    where: { id },
  });

  if (!incidente) {
    throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
  }

  incidente.estado = StatusIncidente.RESUELTO;

  return await this.reporteIncidenteRepository.save(incidente);
}

async marcarCerrado(id: number): Promise<ReporteIncidente> {
  const incidente = await this.reporteIncidenteRepository.findOne({
    where: { id },
  });

  if (!incidente) {
    throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
  }

  incidente.estado = StatusIncidente.CERRADO;

  return await this.reporteIncidenteRepository.save(incidente);
}
}