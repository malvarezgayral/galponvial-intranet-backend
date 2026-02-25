import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { StatusIncidente } from '../enums/vehiculo.enum';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';
import { UsuarioMinimalResponseDto } from 'src/usuario/dto/usuario-response.dto';
import { ObjectServiceResponse } from 'src/usuario/interfaces/object-service-response.interface';

@Injectable()
export class ReporteIncidenteService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly reporteIncidenteRepository: Repository<ReporteIncidente>,
  ) {}

  // ===== MÉTODOS HELPER PARA FILTRADO DE DATOS SENSIBLES =====

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
    };
  }

  /**
   * Filtra un array de ReporteIncidente para devolver sin datos sensibles
   */
  private filterReportesIncidenteResponse(
    incidentes: ReporteIncidente[],
  ): ReporteIncidenteResponseDto[] {
    return incidentes
      .map((incidente) => this.filterReporteIncidenteResponse(incidente))
      .filter((incidente) => incidente !== null);
  }

  /**
   * Obtiene todos los reportes de incidentes con filtros opcionales
   */
  async findAll(
    filtros?: FiltrosIncidenteDto,
  ): Promise<ReporteIncidenteResponseDto[]> {
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

    const reportes = await this.reporteIncidenteRepository.find({
      where,
      relations: ['vehiculo', 'usuario'],
      order: { fecha: 'DESC' },
    });
    return this.filterReportesIncidenteResponse(reportes);
  }

  async findOne(id: number): Promise<ReporteIncidenteResponseDto> {
    const incidente = await this.reporteIncidenteRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'usuario', 'servicios'],
    });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    return this.filterReporteIncidenteResponse(
      incidente,
    ) as ReporteIncidenteResponseDto;
  }

  async actualizarEstadoIncidente(
    id: number,
    nuevoEstado: StatusIncidente,
  ): Promise<ObjectServiceResponse<ReporteIncidenteResponseDto>> {
    const incidente = await this.reporteIncidenteRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'usuario', 'servicios'],
    });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    const estadoAnterior = incidente.estado;

    incidente.estado = nuevoEstado;

    const incidenteActualizado =
      await this.reporteIncidenteRepository.save(incidente);

    return {
      success: true,
      data: this.filterReporteIncidenteResponse(
        incidenteActualizado,
      ) as ReporteIncidenteResponseDto,
      message: `Incidente actualizado de ${estadoAnterior} a ${nuevoEstado}`,
    };
  }
}
