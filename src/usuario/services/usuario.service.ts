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
import { ConfigService } from '@nestjs/config';
import { RefToken } from './ref-token.service';
import {
  UsuarioResponseDto,
  UsuarioMinimalResponseDto,
  UsuarioRolResponseDto,
} from '../dto/usuario-response.dto';
import { ReporteIncidenteResponseDto } from '../../vehiculos/dto/reporte-incidente-response.dto';
import { ServicioResponseDto } from '../../vehiculos/dto/servicio-response.dto';
import { RecordatorioResponseDto } from '../../vehiculos/dto/recordatorio-response.dto';

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
    private readonly configService: ConfigService,
  ) {}

  // ===== MÉTODOS HELPER PARA FILTRADO DE DATOS SENSIBLES =====

  /**
   * Filtra un Usuario para devolver solo datos públicos
   */
  private filterUsuarioRol(usuarioRol: any): UsuarioRolResponseDto | null {
    if (!usuarioRol) return null;
    return {
      fecha_asignacion: usuarioRol.fecha_asignacion,
      fecha_actualizacion: usuarioRol.fecha_actualizacion,
      rol: usuarioRol.rol,
    };
  }

  /**
   * Filtra un array de UsuarioRol para excluir datos redundantes
   */
  private filterUsuariosRolesResponse(
    usuarioRoles: any[],
  ): UsuarioRolResponseDto[] {
    if (!usuarioRoles || usuarioRoles.length === 0) return [];
    return usuarioRoles
      .map((ur) => this.filterUsuarioRol(ur))
      .filter((ur) => ur !== null);
  }

  /**
   * Filtra un Usuario para devolver solo datos públicos
   */
  private filterUsuarioResponse(usuario: Usuario): UsuarioResponseDto | null {
    if (!usuario) return null;
    return {
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      isActive: usuario.isActive,
      fecha_alta: usuario.fecha_alta,
      fecha_baja: usuario.fecha_baja,
      usuarioRoles: usuario.usuarioRoles
        ? this.filterUsuariosRolesResponse(usuario.usuarioRoles)
        : undefined,
    };
  }

  /**
   * Filtra un Usuario para devolver información mínima
   */
  private filterUsuarioMinimal(
    usuario: Usuario,
  ): UsuarioMinimalResponseDto | null {
    if (!usuario) return null;
    return {
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    };
  }

  /**
   * Filtra un array de Usuarios
   */
  private filterUsuariosResponse(usuarios: Usuario[]): UsuarioResponseDto[] {
    if (!usuarios || usuarios.length === 0) return [];
    return usuarios
      .map((u) => this.filterUsuarioResponse(u))
      .filter((u) => u !== null);
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
      vehiculo: incidente.vehiculo,
      servicios: incidente.servicios,
    };
  }

  /**
   * Filtra un array de ReporteIncidente
   */
  private filterReportesIncidenteResponse(
    reportes: any[],
  ): ReporteIncidenteResponseDto[] {
    if (!reportes || reportes.length === 0) return [];
    return reportes
      .map((r) => this.filterReporteIncidenteResponse(r))
      .filter((r) => r !== null);
  }

  /**
   * Filtra Servicio para devolver sin datos sensibles en relaciones
   */
  private filterServicioResponse(servicio: any): ServicioResponseDto | null {
    if (!servicio) return null;
    return {
      id: servicio.id,
      tipo: servicio.tipo,
      fecha_inicio: servicio.fecha_inicio,
      fecha_hasta: servicio.fecha_hasta,
      descripcion: servicio.descripcion,
      incidente_id: servicio.incidente_id,
      incidente: servicio.incidente
        ? this.filterReporteIncidenteResponse(servicio.incidente)
        : undefined,
    };
  }

  /**
   * Filtra un array de Servicio
   */
  private filterServiciosResponse(servicios: any[]): ServicioResponseDto[] {
    if (!servicios || servicios.length === 0) return [];
    return servicios
      .map((s) => this.filterServicioResponse(s))
      .filter((s) => s !== null);
  }

  /**
   * Filtra Recordatorio para devolver sin datos sensibles
   */
  private filterRecordatorioResponse(
    recordatorio: any,
  ): RecordatorioResponseDto | null {
    if (!recordatorio) return null;
    return {
      id: recordatorio.id,
      fecha: recordatorio.fecha,
      descripcion: recordatorio.descripcion,
      usuario: recordatorio.usuario
        ? (this.filterUsuarioMinimal(
            recordatorio.usuario,
          ) as UsuarioMinimalResponseDto)
        : undefined,
    };
  }

  /**
   * Filtra un array de Recordatorio
   */
  private filterRecordatoriosResponse(
    recordatorios: any[],
  ): RecordatorioResponseDto[] {
    if (!recordatorios || recordatorios.length === 0) return [];
    return recordatorios
      .map((r) => this.filterRecordatorioResponse(r))
      .filter((r) => r !== null);
  }

  /**
   * Lee y parsea SUPERADMIN_ALLOWED_DNIS desde el entorno.
   * Fail-safe: si la variable falta o está mal formada, devuelve []
   * (bloquea la asignación de superadmin para todos, nunca la habilita por error).
   */
  private getSuperadminAllowedDnis(): number[] {
    const raw = this.configService.get<string>('SUPERADMIN_ALLOWED_DNIS');
    if (!raw || raw.trim() === '') {
      this.logger.warn(
        'SUPERADMIN_ALLOWED_DNIS no está definida en el entorno. ' +
          'Nadie podrá ser asignado como superadmin hasta que se configure.',
      );
      return [];
    }

    const dnis = raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v));

    const invalidos = dnis.filter((d) => Number.isNaN(d));
    if (invalidos.length > 0) {
      this.logger.error(
        `SUPERADMIN_ALLOWED_DNIS contiene valores inválidos: "${raw}". ` +
          'Nadie podrá ser asignado como superadmin hasta que se corrija.',
      );
      return [];
    }

    return dnis;
  }

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

  async obtenerUsuarios(
    page?: number,
    pageSize?: number,
  ): Promise<UsuarioResponseDto[]> {
    const query = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRoles', 'usuarioRoles')
      .leftJoinAndSelect('usuarioRoles.rol', 'rol');

    if (page && pageSize) {
      const skip = (page - 1) * pageSize;
      query.skip(skip).take(pageSize);
    }

    const usuarios = await query.getMany();
    return this.filterUsuariosResponse(usuarios);
  }

  async obtenerUsuarioPorDni(dni: number): Promise<UsuarioResponseDto | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { dni },
      relations: [
        'usuarioRoles',
        'usuarioRoles.rol',
        'vehiculos',
        'reportesIncidentes',
      ],
    });
    return usuario ? this.filterUsuarioResponse(usuario) : null;
  }

  /**
   * PARA USO INTERNO: Obtienne Usuario completo sin filtrados (incluyendo datos sensibles)
   * NO usar en endpoints, solo para lógica interna de servicios
   */
  async obtenerUsuarioPorDniInternal(dni: number): Promise<Usuario | null> {
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
          nombre: true,
          apellido: true,
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

      //si no tiene roles asignados se lo inautoriza
      if (
        !userWithRoles?.usuarioRoles ||
        userWithRoles.usuarioRoles.length === 0
      ) {
        throw new UnauthorizedException(
          'El usuario no tiene roles asignados, contacta al administrador',
        );
      }

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
        nombre: user.nombre,
        apellido: user.apellido,
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
    currentUserRoles: ValidRoles[],
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

      const usuario = await this.usuarioRepository.findOne({
        where: { dni },
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
      });
      if (!usuario) throw new Error(`Usuario with dni ${dni} not found`);

      const usuarioRoles = usuario.usuarioRoles?.map((ur) => ur.rol.rol) ?? [];
      //Si es superadmin no se puede desactivar
      if (usuarioRoles.includes(ValidRoles.superadmin)) {
        throw new UnauthorizedException(
          'No se puede activar/desactivar un usuario con rol superadmin',
        );
      }
      // Validar si el usuario a modificar es admin - solo superadmin puede hacerlo
      if (
        usuarioRoles.includes(ValidRoles.admin) &&
        !currentUserRoles.includes(ValidRoles.superadmin)
      ) {
        throw new UnauthorizedException(
          'Solo un superadmin puede activar/desactivar usuarios con rol admin',
        );
      }

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
    currentUserRoles: ValidRoles[],
  ): Promise<ObjectServiceResponse<Record<string, unknown>>> {
    try {
      // campos solo para admin
      const adminOnlyFields = ['password', 'tokenVersion'];
      const hasAdminFields = adminOnlyFields.some(
        (field) => updateDto[field] !== undefined,
      );

      // se verifica el caso de que se quiera modificar un campo de admin sin ser admin
      const isAdmin = currentUserRoles.includes(ValidRoles.admin);
      const isSuperadmin = currentUserRoles.includes(ValidRoles.superadmin);
      if (hasAdminFields && !isAdmin && !isSuperadmin) {
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

      // Validar si el usuario a modificar es admin - solo superadmin puede hacerlo
      const usuarioRoles = usuario.usuarioRoles?.map((ur) => ur.rol.rol) ?? [];
      if (usuarioRoles.includes(ValidRoles.admin) && !isSuperadmin) {
        throw new UnauthorizedException(
          'Solo un superadmin puede modificar usuarios con rol admin',
        );
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

      // NOTA: el manejo de roles (rol_ids) fue removido de este método.
      // La única vía oficial para cambiar el rol de un usuario es
      // PATCH /usuario/addRol/:dni -> UsuarioService.addRol()

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
   async addRol(
    dto: AssignRolDto,
    dni: number,
    currentUserRoles?: ValidRoles[],
  ): Promise<Rol> {
    try {
      // Validar la allowlist para asignación de superadmin (2 usuarios fijos: Juan y Daniel)
      if (dto.rol === ValidRoles.superadmin) {
        const allowedDnis = this.getSuperadminAllowedDnis();
        if (!allowedDnis.includes(dni)) {
          throw new BadRequestException(
            `No se puede asignar el rol superadmin al usuario con DNI ${dni}: no está en la lista de usuarios autorizados a tener ese rol`,
          );
        }
      }

      // Validar que solo superadmin pueda asignar rol admin
      if (
        dto.rol === ValidRoles.admin &&
        !currentUserRoles?.includes(ValidRoles.superadmin)
      ) {
        throw new UnauthorizedException(
          'Solo un superadmin puede asignar el rol admin',
        );
      }

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

      // Reemplazo total del rol: se borran las asignaciones previas de ESTE dni
      // (y solo de este dni) y se crea la nueva, en una misma transacción para
      // no dejar al usuario sin ningún rol si algo falla a mitad de camino.
      await this.usuarioRolRepository.manager.transaction(async (manager) => {
        await manager.delete(UsuarioRol, { dni: usuario.dni });

        const usuarioRol = manager.create(UsuarioRol, {
          dni: usuario.dni,
          rol_id: rol.id,
          usuario,
          rol,
        });
        await manager.save(usuarioRol);
      });

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

  async obtenerReportes(): Promise<ReporteIncidenteResponseDto[]> {
    const reportes = await this.reporteIncidenteRepository.find({
      relations: ['usuario', 'vehiculo', 'servicios'],
    });
    return this.filterReportesIncidenteResponse(reportes);
  }

  async obtenerReportesPorUsuario(
    id_usuario: number,
  ): Promise<ReporteIncidenteResponseDto[]> {
    const reportes = await this.reporteIncidenteRepository.find({
      where: { id_usuario },
      relations: ['vehiculo', 'servicios'],
    });
    return this.filterReportesIncidenteResponse(reportes);
  }

  // Servicios

  async obtenerServicios(): Promise<ServicioResponseDto[]> {
    const servicios = await this.servicioRepository.find({
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
    });
    return this.filterServiciosResponse(servicios);
  }

  async obtenerServiciosPorIncidente(
    incidente_id: number,
  ): Promise<ServicioResponseDto[]> {
    const servicios = await this.servicioRepository.find({
      where: { incidente_id },
      relations: ['incidente', 'incidente.vehiculo', 'incidente.usuario'],
    });
    return this.filterServiciosResponse(servicios);
  }

  // ===== Recordatorios =====

  async agregarRecordatorio(
    dni: number,
    data: { fecha: Date; descripcion: string },
  ): Promise<RecordatorioResponseDto> {
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

    const recordatorioGuardado =
      await this.recordatorioRepository.save(recordatorio);

    // Cargar con relaciones para filtrar
    const recordatorioCompleto = await this.recordatorioRepository.findOne({
      where: { id: recordatorioGuardado.id },
      relations: ['usuario'],
    });

    return this.filterRecordatorioResponse(
      recordatorioCompleto,
    ) as RecordatorioResponseDto;
  }

  async getRecordatoriosByUsuario(
    dni: number,
  ): Promise<RecordatorioResponseDto[]> {
    const recordatorios = await this.recordatorioRepository.find({
      where: {
        usuario: { dni },
      },
      relations: ['usuario'],
      order: {
        fecha: 'ASC',
      },
    });
    return this.filterRecordatoriosResponse(recordatorios);
  }

  async updateRecordatorio(
    recordatorioId: number,
    data: { fecha?: Date; descripcion?: string },
  ): Promise<RecordatorioResponseDto> {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id: recordatorioId },
      relations: ['usuario'],
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

    const recordatorioActualizado =
      await this.recordatorioRepository.save(recordatorio);
    return this.filterRecordatorioResponse(
      recordatorioActualizado,
    ) as RecordatorioResponseDto;
  }

  async getRecordatoriosPaginado(
    dni: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    data: RecordatorioResponseDto[];
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

    return {
      data: this.filterRecordatoriosResponse(data),
      total,
      page,
      pageSize,
    };
  }

  async deleteRecordatorio(
    recordatorioId: number,
  ): Promise<ObjectServiceResponse<{ deleted: number }>> {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id: recordatorioId },
    });

    if (!recordatorio) {
      throw new Error('Recordatorio no encontrado');
    }

    const result = await this.recordatorioRepository.delete(recordatorioId);

    return {
      success: true,
      data: { deleted: result.affected || 0 },
      message: 'Recordatorio eliminado correctamente',
    };
  }

  async deleteAllRecordatoriosByUsuario(
    dni: number,
  ): Promise<ObjectServiceResponse<{ deleted: number }>> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { dni },
    });

    if (!usuario) {
      throw new Error(`Usuario con DNI ${dni} no encontrado`);
    }

    const result = await this.recordatorioRepository.delete({
      usuario: { dni },
    });

    return {
      success: true,
      data: { deleted: result.affected || 0 },
      message: `${result.affected || 0} recordatorios eliminados correctamente`,
    };
  }
}