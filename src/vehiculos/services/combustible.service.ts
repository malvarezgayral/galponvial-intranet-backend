import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombustibleCarga } from '../entities/combustible-carga.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { VehiculosService } from './vehiculo.service';
import { UsuarioVehiculoService } from 'src/usuario/services/usuario-vehiculo.service';

@Injectable()
export class CombustibleService {
  constructor(
    @InjectRepository(CombustibleCarga)
    private readonly combustibleRepository: Repository<CombustibleCarga>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    private readonly vehiculosService: VehiculosService,
    private readonly usuarioVehiculoService: UsuarioVehiculoService,
  ) {}

  async create(
    createDto: CreateCombustibleCargaDto,
  ): Promise<CombustibleCarga> {
    // 1. Validar que el vehículo exista y esté activo
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: createDto.id_vehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${createDto.id_vehiculo} no encontrado`,
      );
    }

    // 2. Obtener conductor vigente usando el servicio de usuario-vehiculo
    const conductorVigente =
      await this.usuarioVehiculoService.findConductorVigente(
        createDto.id_vehiculo,
      );

    // Opcional: Validar que exista un conductor asignado
    if (!conductorVigente) {
      throw new BadRequestException(
        `No hay conductor asignado vigente para el vehículo ID ${createDto.id_vehiculo}`,
      );
    }

    try {
      // 3. Actualizar kilometraje y combustible del vehículo
      vehiculo.uso_km = createDto.km_actual;
      vehiculo.uso_combustible += createDto.cant_combustible_despachado;
      await this.vehiculoRepository.save(vehiculo);

      // 4. Crear registro de carga
      const carga = this.combustibleRepository.create({
        fecha_carga: new Date(createDto.fecha_carga),
        despachante: createDto.despachante,
        km_actual: createDto.km_actual,
        cant_combustible_despachado: createDto.cant_combustible_despachado,
        vehiculo,
      });

      const cargaGuardada = await this.combustibleRepository.save(carga);

      // 5. Retornar con relaciones
      const cargaCompleta = await this.combustibleRepository.findOne({
        where: { id_carga: cargaGuardada.id_carga },
        relations: ['vehiculo'],
      });

      if (!cargaCompleta) {
        throw new NotFoundException('Error al recuperar la carga creada');
      }

      return cargaCompleta;
    } catch (error) {
      throw new BadRequestException(
        'Error al registrar carga de combustible: ' + error.message,
      );
    }
  }

  async findAll(): Promise<CombustibleCarga[]> {
    return await this.combustibleRepository.find({
      relations: ['vehiculo'],
      order: { fecha_carga: 'DESC' },
    });
  }
}