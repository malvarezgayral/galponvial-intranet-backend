import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { CombustibleCarga } from '../entities/combustible-carga.entity';
import { FiltrosCombustibleDto } from '../dto/filtros.dto';
import { CombustibleCargaResponseDto } from '../dto/combustible-carga-response.dto';
import { UsuarioVehiculoService } from 'src/usuario/services/usuario-vehiculo.service';

@Injectable()
export class CombustibleService {
  constructor(
    @InjectRepository(CombustibleCarga)
    private readonly combustibleRepository: Repository<CombustibleCarga>,
    private readonly usuarioVehiculoService: UsuarioVehiculoService,
  ) {}

  async findAll(): Promise<CombustibleCarga[]> {
    return await this.combustibleRepository.find({
      relations: ['vehiculo'],
      order: { fecha_carga: 'DESC' },
    });
  }

  async findWithMetrics(
    filtros: FiltrosCombustibleDto,
  ): Promise<CombustibleCargaResponseDto[]> {
    const queryBuilder = this.combustibleRepository
      .createQueryBuilder('carga')
      .leftJoinAndSelect('carga.vehiculo', 'vehiculo');

    // Aplicar filtros
    if (filtros.vehiculoId) {
      queryBuilder.andWhere('vehiculo.id_vehiculo = :vehiculoId', {
        vehiculoId: filtros.vehiculoId,
      });
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      queryBuilder.andWhere(
        'carga.fecha_carga BETWEEN :fechaDesde AND :fechaHasta',
        {
          fechaDesde: filtros.fecha_desde,
          fechaHasta: filtros.fecha_hasta,
        },
      );
    } else if (filtros.fecha_desde) {
      queryBuilder.andWhere('carga.fecha_carga >= :fechaDesde', {
        fechaDesde: filtros.fecha_desde,
      });
    } else if (filtros.fecha_hasta) {
      queryBuilder.andWhere('carga.fecha_carga <= :fechaHasta', {
        fechaHasta: filtros.fecha_hasta,
      });
    }

    const cargas = await queryBuilder
      .orderBy('carga.fecha_carga', 'DESC')
      .addOrderBy('carga.km_actual', 'DESC')
      .getMany();

    // Procesar cada carga para calcular métricas
    const resultado: CombustibleCargaResponseDto[] = [];

    for (const carga of cargas) {
      // Obtener conductor vigente en la fecha de la carga
      const conductor = await this.obtenerConductorEnFecha(
        carga.vehiculo.id_vehiculo,
        carga.fecha_carga,
      );

      // Obtener carga anterior del mismo vehículo
      const cargaAnterior = await this.obtenerCargaAnterior(
        carga.vehiculo.id_vehiculo,
        carga.fecha_carga,
        carga.km_actual,
      );

      // Calcular recorrido y rendimiento
      const recorrido = cargaAnterior
        ? carga.km_actual - cargaAnterior.km_actual
        : 0;

      const rendimiento =
        recorrido > 0 && carga.cant_combustible_despachado > 0
          ? parseFloat(
              (recorrido / carga.cant_combustible_despachado).toFixed(2),
            )
          : 0;

      resultado.push({
        vehiculo: `${carga.vehiculo.nombre} - ${carga.vehiculo.marca} ${carga.vehiculo.modelo}`,
        fecha: carga.fecha_carga.toISOString().split('T')[0],
        despachante: carga.despachante || 'N/A',
        operador: conductor || 'N/A',
        km_actual: carga.km_actual,
        litros: carga.cant_combustible_despachado,
        recorrido,
        rendimiento,
      });
    }

    return resultado;
  }

  private async obtenerCargaAnterior(
    idVehiculo: number,
    fechaCarga: Date,
    kmActual: number,
  ): Promise<CombustibleCarga | null> {
    return await this.combustibleRepository
      .createQueryBuilder('carga')
      .leftJoin('carga.vehiculo', 'vehiculo')
      .where('vehiculo.id_vehiculo = :idVehiculo', { idVehiculo })
      .andWhere('carga.km_actual < :kmActual', { kmActual })
      .orderBy('carga.km_actual', 'DESC')
      .getOne();
  }

  private async obtenerConductorEnFecha(
    idVehiculo: number,
    fecha: Date,
  ): Promise<string | null> {
    try {
      const usuarioVehiculo =
        await this.usuarioVehiculoService.findConductorVigenteEnFecha(
          idVehiculo,
          fecha,
        );

      if (usuarioVehiculo?.usuario) {
        return `${usuarioVehiculo.usuario.nombre} ${usuarioVehiculo.usuario.apellido}`;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}