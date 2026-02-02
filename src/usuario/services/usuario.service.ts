import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioRol } from '../entities/usuario-rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Recordatorio } from '../../vehiculos/entities/recordatorio.entity';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
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
import { RefToken } from './ref-token.service';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(UsuarioVehiculo)
    private usuarioVehiculoRepository: Repository<UsuarioVehiculo>,
    @InjectRepository(ReporteIncidente)
    private reporteIncidenteRepository: Repository<ReporteIncidente>,
    @InjectRepository(Servicio)
    private servicioRepository: Repository<Servicio>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Recordatorio)
    private recordatorioRepository: Repository<Recordatorio>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => RefToken))
    private refTokenService: RefToken,
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
      roles: [],
    };
    return await this.usuarioRepository.save(usuario);
  }

  async obtenerUsuarios(page?: number, pageSize?: number): Promise<Usuario[]> {
    const query = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRoles', 'usuarioRoles')
      .leftJoinAndSelect('usuarioRoles.rol', 'rol');

    if (page && pageSize) {
      const skip = (page - 1) * pageSize;
      query.skip(skip).take(pageSize);
    }

    return await query.getMany();
  }

  async obtenerUsuarioPorDni(dni: number): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { dni },
      relations: [
        'usuarioRoles',
        'usuarioRoles.rol',
        'vehiculos',
        'reportesIncidentes',
      ],
    });
  }

  async obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { email },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
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
        select: {
          email: true,
          password: true,
          isActive: true,
          dni: true,
          tokenVersion: true,
        },
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

      // Segunda query: obtener los roles completos
      const userWithRoles = await this.usuarioRepository.findOne({
        where: { email },
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
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
      // Extraer permisos de TODOS los roles del usuario (sin duplicados)
      const permisos = Array.from(
        new Set(
          userWithRoles?.roles?.flatMap((rol) => rol.permisos ?? []) ?? [],
        ),
      );

      const jwtResponse: JwtLoginResponse = {
        dni: user.dni,
        email: user.email,
        rol: userWithRoles?.roles?.[0]?.rol ?? 'sin_rol',
        permisos,
        accessToken,
        refreshToken,
        tokenVersion: user.tokenVersion,
      };
      await this.refTokenService.createRefreshToken({
        refreshToken,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '2d') as never,
        dni: user.dni,
      });
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
      if (usuario.refreshTokens && usuario.refreshTokens.length > 0) {
        await this.refreshTokenRepository.remove(usuario.refreshTokens);
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
  ): Promise<ObjectServiceResponse<Record<string, unknown>>> {
    try {
      // campos solo para admin
      const adminOnlyFields = ['password', 'tokenVersion', 'rol_ids'];
      const hasAdminFields = adminOnlyFields.some(
        (field) => updateDto[field] !== undefined,
      );

      // se verifica el caso de que se quiera modificar un campo de admin sin ser admin
      if (hasAdminFields && currentUserRol !== ValidRoles.admin) {
        return {
          success: false,
          data: {},
          message: 'No tienes permisos para modificar esos campos',
        };
      }

      const usuario = await this.usuarioRepository.findOne({
        where: { dni },
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
      });

      if (!usuario) {
        throw new BadRequestException(`Usuario con DNI ${dni} no encontrado`);
      }

      // Objeto para almacenar los cambios realizados
      const cambiosRealizados: Record<string, unknown> = {};

      // Actualizar campos genéricos
      if (updateDto.nombre !== undefined) {
        usuario.nombre = updateDto.nombre;
        cambiosRealizados.nombre = updateDto.nombre;
      }
      if (updateDto.apellido !== undefined) {
        usuario.apellido = updateDto.apellido;
        cambiosRealizados.apellido = updateDto.apellido;
      }
      if (updateDto.email !== undefined) {
        usuario.email = updateDto.email;
        cambiosRealizados.email = updateDto.email;
      }

      // Actualizar campos solo admin
      if (updateDto.password !== undefined) {
        const salt = await bcrypt.genSalt();
        usuario.password = await bcrypt.hash(updateDto.password, salt);
        cambiosRealizados.password = '***actualizado***';
      }

      if (updateDto.tokenVersion !== undefined) {
        usuario.tokenVersion = updateDto.tokenVersion;
        cambiosRealizados.tokenVersion = updateDto.tokenVersion;
      }

      // Manejar actualización de roles
      if (updateDto.rol_ids !== undefined && updateDto.rol_ids.length >= 0) {
        // Validar y traer cada rol individualmente
        const roles: Rol[] = [];
        for (const rol_id of updateDto.rol_ids) {
          const rol = await this.rolRepository.findOne({
            where: { id: rol_id },
          });

          if (!rol) {
            throw new BadRequestException(
              `El rol con ID ${rol_id} no existe en la base de datos`,
            );
          }

          roles.push(rol);
        }

        // Eliminar todas las asignaciones de rol previas
        await this.usuarioRolRepository.delete({ dni: usuario.dni });

        // Crear nuevas asignaciones para cada rol
        if (roles.length > 0) {
          const usuarioRoles = roles.map((rol) =>
            this.usuarioRolRepository.create({
              dni: usuario.dni,
              rol_id: rol.id,
              usuario,
              rol,
            }),
          );

          // Guardar todos los nuevos registros
          await this.usuarioRolRepository.save(usuarioRoles);
          usuario.usuarioRoles = usuarioRoles;
          cambiosRealizados.rol_ids = updateDto.rol_ids;
          cambiosRealizados.roles = usuarioRoles.map((ur) => ({
            id: ur.rol_id,
            rol: ur.rol.rol,
            permisos: ur.rol.permisos,
          }));
        }
      }

      // Guardar cambios
      await this.usuarioRepository.save(usuario);

      return {
        success: true,
        data: cambiosRealizados,
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

  async refreshToken(email: string): Promise<
    ObjectServiceResponse<{
      accessToken: string;
      tokenVersion: number;
      permisos: string[];
      rol: string;
      dni: number;
    }>
  > {
    try {
      const user = await this.usuarioRepository.findOne({
        where: { email },
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
        select: {
          email: true,
          tokenVersion: true,
          dni: true,
        },
      });

      if (!user) {
        throw new BadRequestException(
          `Usuario con email ${email} no encontrado`,
        );
      }

      // Extraer permisos de TODOS los roles del usuario (sin duplicados)
      const rol = user.roles?.[0]?.rol ?? 'sin_rol';
      const permisos = Array.from(
        new Set(user.roles?.flatMap((r) => r.permisos ?? []) ?? []),
      );

      const accessToken = this.getJwtToken(
        { email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '60m') as never,
        },
      );
      return {
        success: true,
        data: {
          accessToken,
          tokenVersion: user.tokenVersion,
          permisos,
          rol,
          dni: user.dni,
        },
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.refreshToken',
      );
      throw error;
    }
  }

  async logout(
    email: string,
  ): Promise<ObjectServiceResponse<{ revoked: number }>> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { email },
        relations: ['refreshTokens'],
      });

      if (!usuario) {
        throw new BadRequestException(
          `Usuario con email ${email} no encontrado`,
        );
      }

      if (!usuario.refreshTokens || usuario.refreshTokens.length === 0) {
        throw new BadRequestException('No hay sesión activa para revocar');
      }

      // Revocar todos los tokens activos (no revocados)
      const activeTokens = usuario.refreshTokens.filter((rt) => !rt.revoked);

      if (activeTokens.length === 0) {
        return {
          success: false,
          data: { revoked: 0 },
          message: 'No hay sesiones activas para revocar',
        };
      }

      // Marcar como revocados todos los tokens activos
      activeTokens.forEach((token) => {
        token.revoked = true;
      });

      await this.refreshTokenRepository.save(activeTokens);

      return {
        success: true,
        data: { revoked: activeTokens.length },
        message: `${activeTokens.length} sesión/es revocada/s correctamente`,
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioService.logout',
      );
      throw error;
    }
  }

  // Roles
  async addRol(dto: AssignRolDto, dni: number): Promise<Rol> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { dni },
        relations: ['usuarioRoles'],
      });

      if (!usuario) {
        throw new Error(`Usuario with dni ${dni} not found`);
      }
      this.logger.log(`Assigning role ${dto.rol} to user ${usuario.nombre}`);
      const rol = await this.rolRepository.findOne({ where: { rol: dto.rol } });

      if (!rol) {
        throw new Error(`Rol ${dto.rol} not found`);
      }

      // Crear la asignación en la tabla usuario_rol
      const usuarioRol = this.usuarioRolRepository.create({
        dni: usuario.dni,
        rol_id: rol.id,
        usuario,
        rol,
      });

      await this.usuarioRolRepository.save(usuarioRol);
      return rol;
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

  // ===== Recordatorios =====

  async agregarRecordatorio(
    dni: number,
    data: { fecha: Date; descripcion: string },
  ): Promise<Recordatorio> {
    const usuario = await this.usuarioRepository.findOne({
      where: { dni },
    });

    if (!usuario) {
      throw new Error(`Usuario con DNI ${dni} no encontrado`);
    }

    const recordatorio = this.recordatorioRepository.create({
      fecha: data.fecha,
      descripcion: data.descripcion,
      usuario,
    });

    return await this.recordatorioRepository.save(recordatorio);
  }

  async getRecordatoriosByUsuario(dni: number): Promise<Recordatorio[]> {
    return this.recordatorioRepository.find({
      where: {
        usuario: { dni },
      },
      order: {
        fecha: 'ASC',
      },
    });
  }

  async updateRecordatorio(
    recordatorioId: number,
    data: { fecha?: Date; descripcion?: string },
  ): Promise<Recordatorio> {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id: recordatorioId },
    });

    if (!recordatorio) {
      throw new Error('Recordatorio no encontrado');
    }

    if (data.fecha !== undefined) {
      recordatorio.fecha = new Date(data.fecha);
    }

    if (data.descripcion !== undefined) {
      recordatorio.descripcion = data.descripcion;
    }

    return this.recordatorioRepository.save(recordatorio);
  }

  async getRecordatoriosPaginado(
    dni: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: Recordatorio[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // Validar que el usuario existe
    await this.obtenerUsuarioPorDni(dni);

    const [data, total] = await this.recordatorioRepository.findAndCount({
      where: { usuario: { dni } },
      relations: ['usuario'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { fecha: 'ASC' },
    });

    return { data, total, page, pageSize };
  }
}
