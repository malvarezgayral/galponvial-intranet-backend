import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { Vehiculo } from './entities/vehiculo.entity';
import { CreateCombustibleCargaDto } from './dto/create-combustible-carga.dto';
import { FiltrosCombustibleDto } from './dto/filtros.dto';

@Injectable()
export class CombustibleService {
  constructor(
    @InjectRepository(CombustibleCarga)
    private readonly combustibleRepository: Repository<CombustibleCarga>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) {}

  async create(createDto: CreateCombustibleCargaDto): Promise<CombustibleCarga> {
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: createDto.id_vehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    try {
      // Actualizar el kilometraje del vehículo
      vehiculo.uso_km = createDto.km_actual;
      vehiculo.uso_combustible += createDto.cant_combustible_despachado;
      await this.vehiculoRepository.save(vehiculo);

      // Crear registro de carga
      const carga = this.combustibleRepository.create({
        ...createDto,
        vehiculo,
      });

      return await this.combustibleRepository.save(carga);
    } catch (error) {
      throw new BadRequestException('Error al registrar carga: ' + error.message);
    }
  }

  async findAll(filtros: FiltrosCombustibleDto): Promise<CombustibleCarga[]> {
    const where: any = {};

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      where.fecha_carga = Between(new Date(filtros.fecha_desde), new Date(filtros.fecha_hasta));
    }

    return await this.combustibleRepository.find({
      where,
      relations: ['vehiculo'],
      order: { fecha_carga: 'DESC' },
    });
  }

  async findByVehiculo(idVehiculo: number): Promise<CombustibleCarga[]> {
    return await this.combustibleRepository.find({
      where: { vehiculo: { id_vehiculo: idVehiculo } },
      relations: ['vehiculo'],
      order: { fecha_carga: 'DESC' },
    });
  }

  async calcularRendimiento(idCarga: number): Promise<any> {
    const carga = await this.combustibleRepository.findOne({
      where: { id_carga: idCarga },
      relations: ['vehiculo'],
    });

    if (!carga) {
      throw new NotFoundException('Carga no encontrada');
    }

    // Buscar la carga anterior
    const cargaAnterior = await this.combustibleRepository.findOne({
      where: {
        vehiculo: { id_vehiculo: carga.vehiculo.id_vehiculo },
        id_carga: Between(1, carga.id_carga - 1),
      },
      order: { id_carga: 'DESC' },
    });

    if (!cargaAnterior) {
      return {
        mensaje: 'No hay carga anterior para calcular rendimiento',
        rendimiento: null,
      };
    }

    const kmRecorridos = carga.km_actual - cargaAnterior.km_actual;
    const combustibleUsado = cargaAnterior.cant_combustible_despachado;
    const rendimiento = kmRecorridos / combustibleUsado;

    return {
      kmRecorridos,
      combustibleUsado,
      rendimiento: rendimiento.toFixed(2),
      unidad: `km/${carga.vehiculo.unidad_medida_combustible}`,
    };
  }
}