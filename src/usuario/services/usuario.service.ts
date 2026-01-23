import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
  AssignRolDto,
  UpdateUsuarioDto,
} from '../dto/usuario.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/login.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import {
  JwtLoginResponse,
  ObjectServiceResponse,
} from '../interfaces/object-service-response.interface';
import { DeActivateUserDto } from '../dto/de-activate.dto';
import { ValidRoles } from '../enums/usuario.enum';

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
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  // Usuarios
  async crearUsuario(CreateUsuarioDto: CreateUsuarioDto) {
    const { dni: userDni, email: userEmail, password } = CreateUsuarioDto;

    const usuarioPorDni = await this.obtenerUsuarioPorDni(userDni);
    if (usuarioPorDni) {
      throw new BadRequestException('User with this DNI already exists');
    }

    const usuarioPorEmail = await this.obtenerUsuarioPorEmail(userEmail);
    if (usuarioPorEmail) {
      throw new BadRequestException('Email is already in use');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const usuario: DeepPartial<Usuario> = {
      ...CreateUsuarioDto,
      password: hash,
      fecha_alta: new Date(), //dia de hoy
      fecha_baja: undefined,
      rol: undefined,
    };
    return await this.usuarioRepository.save(usuario);
  }

  async obtenerUsuarios(page?: number, pageSize?: number): Promise<Usuario[]> {
    const query = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol');

    if (page && pageSize) {
      const skip = (page - 1) * pageSize;
      query.skip(skip).take(pageSize);
    }

    return await query.getMany();
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

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<ObjectServiceResponse<JwtLoginResponse>> {
    const { password, email } = loginUserDto;

    try {
      // Primera query: validar credenciales
      const user = await this.usuarioRepository.findOne({
        where: { email },
        select: { email: true, password: true, isActive: true, dni: true },
      });

      if (!user) {
        throw new BadRequestException('Credenciales inválidas');
      }
      if (user && !user.isActive) {
        throw new BadRequestException('El usuario no está activo');
      }

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credenciales inválidas (contraseña)');

      this.logger.log(`Usuario ${user.email} logged in successfully`);

      // Segunda query: obtener el rol completo
      const userWithRol = await this.usuarioRepository.findOne({
        where: { email },
        relations: ['rol'],
      });

      const accessToken = this.getJwtToken(
        { email: user.email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '60m') as never,
        },
      );
      const refreshToken = this.getJwtToken(
        { email: user.email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '2d') as never,
        },
      );
      const jwtResponse: JwtLoginResponse = {
        email: user.email,
        rol: userWithRol?.rol?.rol || 'sin_rol',
        accessToken,
        refreshToken,
      };
      return {
        success: true,
        data: jwtResponse,
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.login',
      );
      throw error;
    }
  }

  async activarDesactivarUsuario(
    { dni, isActive }: DeActivateUserDto,
    currentUserDni: number,
  ): Promise<ObjectServiceResponse<Usuario | number>> {
    try {
      // Validar que no intente modificarse a sí mismo
      if (dni == currentUserDni) {
        return {
          success: false,
          data: dni,
          message: 'El usuario no puede activarse/desactivarse a sí mismo',
        }; // se retorna si no precisa cambios
      }

      const usuario = await this.usuarioRepository.findOne({ where: { dni } });
      if (!usuario) throw new Error(`Usuario with dni ${dni} not found`);

      if (isActive == usuario.isActive) {
        return {
          success: false,
          data: usuario,
          message: isActive
            ? 'El usuario ya está activo'
            : 'El usuario ya está inactivo',
        }; // se retorna si no precisa cambios
      }
      usuario.isActive = isActive;
      // se elimina el ref token para simular lo que seria un invalidar sesion
      if (usuario.refreshToken) {
        await this.refreshTokenRepository.remove(usuario.refreshToken);
      }
      if (isActive) usuario.fecha_baja = null;
      else usuario.fecha_baja = new Date();
      return {
        success: true,
        data: await this.usuarioRepository.save(usuario),
        message: isActive
          ? 'Usuario activado correctamente'
          : 'Usuario desactivado correctamente',
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.activarDesactivarUsuario',
      );
      throw error;
    }
  }

  async updateUsuario(
    dni: number,
    updateDto: UpdateUsuarioDto,
    currentUserRol: ValidRoles,
  ): Promise<ObjectServiceResponse<Usuario | null>> {
    try {
      // campos solo para admin
      const adminOnlyFields = ['password', 'tokenVersion', 'rol'];
      const hasAdminFields = adminOnlyFields.some(
        (field) => updateDto[field] !== undefined,
      );

      // se verifica el caso de que se quiera modificar un campo de admin sin ser admin
      if (hasAdminFields && currentUserRol !== ValidRoles.admin) {
        return {
          success: false,
          data: null,
          message: 'No tienes permisos para modificar esos campos',
        };
      }

      const usuario = await this.usuarioRepository.findOne({
        where: { dni },
        relations: ['rol'],
      });

      if (!usuario) {
        throw new BadRequestException(`Usuario con DNI ${dni} no encontrado`);
      }

      // esto quizas no sea necesario verificar ya que el dto no tiene isActive
      if ('isActive' in updateDto && updateDto.isActive !== undefined) {
        throw new BadRequestException(
          'No puedes modificar isActive. Usa el endpoint de activar/desactivar',
        );
      }

      // Actualizar campos genéricos
      if (updateDto.nombre !== undefined) usuario.nombre = updateDto.nombre;
      if (updateDto.apellido !== undefined)
        usuario.apellido = updateDto.apellido;
      if (updateDto.email !== undefined) usuario.email = updateDto.email;

      // Actualizar campos solo admin
      if (updateDto.password !== undefined) {
        const salt = await bcrypt.genSalt();
        usuario.password = await bcrypt.hash(updateDto.password, salt);
      }

      //esto luego hay que verificar que solo haga un +1 o un reset
      if (updateDto.tokenVersion !== undefined) {
        usuario.tokenVersion = updateDto.tokenVersion;
      }

      if (updateDto.rol !== undefined) {
        const rol = await this.rolRepository.findOne({
          where: { rol: updateDto.rol },
        });
        if (!rol) {
          throw new BadRequestException(`Rol ${updateDto.rol} no existe`);
        }
        usuario.rol = rol;
      }

      // Guardar cambios
      const usuarioActualizado = await this.usuarioRepository.save(usuario);

      return {
        success: true,
        data: usuarioActualizado,
        message: 'Usuario actualizado correctamente',
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.updateUsuario',
      );
      throw error;
    }
  }

  private getJwtToken(payload: JwtPayload, options?: JwtSignOptions) {
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  public refreshToken(email: string) {
    const accessToken = this.getJwtToken(
      { email },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '60m') as never,
      },
    );
    return {
      success: true,
      data: { accessToken },
      message: 'Token refreshed successfully',
    };
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
