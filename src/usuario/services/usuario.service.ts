import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import {
  CreateUsuarioDto,
  CreateRolDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
} from '../dto/usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioVehiculo)
    private usuarioVehiculoRepository: Repository<UsuarioVehiculo>,
    @InjectRepository(ReporteIncidente)
    private reporteIncidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
  ) {}

  // Usuarios
  async crearUsuario(dto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = {
      ...dto,
      fecha_alta: new Date(dto.fecha_alta),
      fecha_baja: dto.fecha_baja ? new Date(dto.fecha_baja) : null,
    };
    return this.usuarioRepository.save(usuario as Partial<Usuario>);
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ relations: ['rol'] });
  }

  async obtenerUsuarioPorDni(dni: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { dni },
      relations: ['rol', 'vehiculos', 'reportesIncidentes'],
    });
  }

  // Roles
  async crearRol(dto: CreateRolDto): Promise<Rol> {
    return this.rolRepository.save(dto as Partial<Rol>);
  }

  async obtenerRoles(): Promise<Rol[]> {
    return this.rolRepository.find({ relations: ['usuarios'] });
  }

  // Usuario-Vehiculo
  async asignarVehiculo(dto: CreateUsuarioVehiculoDto) {
    const usuarioVehiculo = {
      ...dto,
      fecha_desde: new Date(dto.fecha_desde),
      fecha_hasta: dto.fecha_hasta ? new Date(dto.fecha_hasta) : null,
    };
    return this.usuarioVehiculoRepository.save(
      usuarioVehiculo as Partial<UsuarioVehiculo>,
    );
  }

  async obtenerVehiculosPorUsuario(
    id_usuario: number,
  ): Promise<UsuarioVehiculo[]> {
    return this.usuarioVehiculoRepository.find({
      where: { id_usuario },
      relations: ['vehiculo'],
    });
  }

  // Reportes
  async crearReporte(
    dto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    const reporte = {
      ...dto,
      fecha: new Date(dto.fecha),
    };
    return this.reporteIncidenteRepository.save(
      reporte as Partial<ReporteIncidente>,
    );
  }

  async obtenerReportes(): Promise<ReporteIncidente[]> {
    return this.reporteIncidenteRepository.find({
      relations: ['usuario', 'vehiculo', 'servicios'],
    });
  }

  async obtenerReportesPorUsuario(
    id_usuario: number,
  ): Promise<ReporteIncidente[]> {
    return this.reporteIncidenteRepository.find({
      where: { id_usuario },
      relations: ['vehiculo', 'servicios'],
    });
  }

  // Servicios
  async crearServicio(dto: CreateServicioDto): Promise<Servicio> {
    const servicio = {
      ...dto,
      fecha_inicio: new Date(dto.fecha_inicio),
      fecha_hasta: new Date(dto.fecha_hasta),
    };
    return this.servicioRepository.save(servicio as Partial<Servicio>);
  }

  async obtenerServicios(): Promise<Servicio[]> {
    return this.servicioRepository.find({ relations: ['incidente'] });
  }

  async obtenerServiciosPorIncidente(
    incidente_id: number,
  ): Promise<Servicio[]> {
    return this.servicioRepository.find({
      where: { incidente_id },
    });
  }
}
