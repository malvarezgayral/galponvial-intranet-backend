import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
  AssignRolDto,
} from '../dto/usuario.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/login.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

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
    private readonly jwtService: JwtService,
  ) {}

  // Usuarios
  async crearUsuario(CreateUsuarioDto: CreateUsuarioDto) {
    const pass = CreateUsuarioDto.password;
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(pass, salt);

    const usuario: DeepPartial<Usuario> = {
      ...CreateUsuarioDto,
      password: hash,
      fecha_alta: new Date(), //dia de hoy
      fecha_baja: undefined,
      rol: undefined,
    };
    return await this.usuarioRepository.save(usuario);
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({ relations: ['rol'] });
  }

  async obtenerUsuarioPorDni(dni: number): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { dni },
      relations: ['rol', 'vehiculos', 'reportesIncidentes'],
    });
  }

  async obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { email },
      relations: ['rol'],
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, dni } = loginUserDto;

    try {
      const user = await this.usuarioRepository.findOne({
        where: { dni },
        select: { dni: true, password: true },
      });

      if (!user) throw new UnauthorizedException('Credentials are not valid');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credentials are not valid (password)');

      this.logger.log(`Usuario ${user.dni} logged in successfully`);
      return {
        dni: user.dni,
        token: this.getJwtToken({ dni: user.dni }),
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.login',
      );
      throw error;
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  // Roles
  async addRol(dto: AssignRolDto, dni: number): Promise<Rol> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { dni },
      });

      if (!usuario) {
        throw new Error(`Usuario with dni ${dni} not found`);
      }
      this.logger.log(`Assigning role ${dto.rol} to user ${usuario.nombre}`);
      const rol = await this.rolRepository.findOne({ where: { rol: dto.rol } });

      if (!rol) {
        throw new Error(`Rol ${dto.rol} not found`);
      }
      usuario.rol = rol;
      return this.usuarioRepository.save(usuario).then(() => rol);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.addRol',
      );
      throw error;
    }
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
