import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { StatusIncidente } from '../enums/vehiculo.enum';
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
