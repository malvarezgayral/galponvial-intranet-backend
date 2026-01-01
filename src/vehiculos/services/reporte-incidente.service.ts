import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';
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
        id_usuario: conductorVigente.id_usuario, // ← Obtenido del vehículo
        vehiculo,
        usuario: conductorVigente.usuario,
      });

      const reporteGuardado =
        await this.reporteIncidenteRepository.save(reporte);

      // 4. Si la falla es CRÍTICA, cambiar status del vehículo
      if (createDto.falla === FallaIncidente.CRITICA) {
        // Cambiar status usando el servicio de vehículos (responsabilidad correcta)
        await this.vehiculosService.updateStatus(
          vehiculo.id_vehiculo,
          VehiculoStatus.FUERA_DE_SERVICIO,
        );

        // Crear registro histórico en status_update
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
