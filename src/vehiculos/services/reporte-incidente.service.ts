import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';
import { StatusUpdateService } from './status-update.service';

@Injectable()
export class ReporteIncidenteService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly reporteIncidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  async create(
    createDto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    // 1. Validar que el vehículo exista
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id_vehiculo: createDto.id_vehiculo },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${createDto.id_vehiculo} no encontrado`,
      );
    }

    // 2. Validar que el usuario exista
    const usuario = await this.usuarioRepository.findOne({
      where: { dni: createDto.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con DNI ${createDto.id_usuario} no encontrado`,
      );
    }

    try {
      // 3. Crear reporte de incidente
      const reporte = this.reporteIncidenteRepository.create({
        fecha: new Date(createDto.fecha),
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        falla: createDto.falla,
        id_vehiculo: createDto.id_vehiculo,
        id_usuario: createDto.id_usuario,
        vehiculo,
        usuario,
      });

      const reporteGuardado =
        await this.reporteIncidenteRepository.save(reporte);

      // 4. Si la falla es CRÍTICA, cambiar status del vehículo
      if (createDto.falla === FallaIncidente.CRITICA) {
        // Cerrar status actual
        await this.statusUpdateService.cerrarStatusActual(vehiculo.id_vehiculo);

        // Cambiar status del vehículo
        vehiculo.status = VehiculoStatus.FUERA_DE_SERVICIO;
        await this.vehiculoRepository.save(vehiculo);

        // Crear nuevo status_update
        await this.statusUpdateService.crearStatusUpdate(
          vehiculo,
          VehiculoStatus.FUERA_DE_SERVICIO,
        );
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

  async findAll(): Promise<ReporteIncidente[]> {
    return await this.reporteIncidenteRepository.find({
      relations: ['vehiculo', 'usuario'],
      order: { fecha: 'DESC' },
    });
  }
}