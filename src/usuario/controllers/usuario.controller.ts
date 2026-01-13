import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsuarioService } from '../services/usuario.service';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
  AssignRolDto,
} from '../dto/usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import { LoginUserDto } from '../dto/login.dto';
import { Auth } from '../decorators/auth.decorator';
import { ValidRoles } from '../enums/usuario.enum';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  private logger = new Logger(UsuarioController.name);

  constructor(private readonly usuarioService: UsuarioService) {}

  // ==================== USUARIOS ====================

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o usuario existente',
  })
  async crearUsuario(@Body() createUserDto: CreateUsuarioDto) {
    try {
      const {
        password,
        repeatedPassword,
        email: userEmail,
        dni: userDni,
      } = createUserDto;

      if (password !== repeatedPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const usuarioPorDni =
        await this.usuarioService.obtenerUsuarioPorDni(userDni);
      if (usuarioPorDni) {
        throw new BadRequestException('User with this DNI already exists');
      }

      const usuarioPorEmail =
        await this.usuarioService.obtenerUsuarioPorEmail(userEmail);
      if (usuarioPorEmail) {
        throw new BadRequestException('Email is already in use');
      }

      return this.usuarioService.crearUsuario(createUserDto);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioController.crearUsuario',
      );
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, devuelve token JWT',
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciales inválidas',
  })
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ dni: number; token: string }> {
    try {
      const dni = loginUserDto.dni;

      const usuario = await this.usuarioService.obtenerUsuarioPorDni(dni);

      if (!usuario) {
        throw new BadRequestException('Invalid credentials');
      }

      if (usuario && !usuario.isActive) {
        throw new BadRequestException('El usuario no está activo');
      }

      return this.usuarioService.login(loginUserDto);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioController.crearUsuario',
      );
      throw error;
    }
  }

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios',
    type: [Usuario],
  })
  @Get()
  @Auth()
  obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioService.obtenerUsuarios();
  }

  @ApiOperation({ summary: 'Obtener usuario por DNI' })
  @ApiParam({
    name: 'dni',
    type: Number,
    description: 'DNI del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: Usuario,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':dni')
  @Auth()
  obtenerUsuarioPorDni(@Param('dni') dni: number): Promise<Usuario | null> {
    return this.usuarioService.obtenerUsuarioPorDni(dni);
  }

  // ==================== ROLES ====================

  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiParam({
    name: 'dni',
    type: Number,
    description: 'DNI del usuario',
  })
  @ApiBody({ type: AssignRolDto })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado correctamente',
    type: Rol,
  })
  @Patch('addRol/:dni')
  @Auth(ValidRoles.admin)
  asignarRol(
    @Param('dni') dni: number,
    @Body() dto: AssignRolDto,
  ): Promise<Rol> {
    return this.usuarioService.addRol(dto, dni);
  }

  // ==================== USUARIO - VEHÍCULO ====================

  @ApiOperation({ summary: 'Asignar un vehículo a un usuario' })
  @ApiBody({ type: CreateUsuarioVehiculoDto })
  @ApiResponse({
    status: 201,
    description: 'Vehículo asignado al usuario',
  })
  @Post('asignar-vehiculo')
  @Auth(ValidRoles.admin)
  asignarVehiculo(@Body() dto: CreateUsuarioVehiculoDto) {
    return this.usuarioService.asignarVehiculo(dto);
  }

  @ApiOperation({ summary: 'Obtener vehículos asignados a un usuario' })
  @ApiParam({
    name: 'id_usuario',
    type: Number,
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de vehículos asignados',
    type: [UsuarioVehiculo],
  })
  @Get(':id_usuario/vehiculos')
  @Auth()
  obtenerVehiculosPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<UsuarioVehiculo[]> {
    return this.usuarioService.obtenerVehiculosPorUsuario(parseInt(id_usuario));
  }

  // ==================== REPORTES ====================

  @ApiOperation({ summary: 'Crear un reporte de incidente' })
  @ApiBody({ type: CreateReporteIncidenteDto })
  @ApiResponse({
    status: 201,
    description: 'Reporte creado correctamente',
    type: ReporteIncidente,
  })
  @Post('reporte')
  @Auth()
  crearReporte(
    @Body() dto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    return this.usuarioService.crearReporte(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los reportes' })
  @ApiResponse({
    status: 200,
    description: 'Listado de reportes',
    type: [ReporteIncidente],
  })
  @Get('reporte/all')
  @Auth()
  obtenerReportes(): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportes();
  }

  @ApiOperation({ summary: 'Obtener reportes por usuario' })
  @ApiParam({
    name: 'id_usuario',
    type: Number,
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de reportes del usuario',
    type: [ReporteIncidente],
  })
  @Get(':id_usuario/reportes')
  @Auth()
  obtenerReportesPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportesPorUsuario(parseInt(id_usuario));
  }

  // ==================== SERVICIOS ====================

  @ApiOperation({ summary: 'Crear un servicio' })
  @ApiBody({ type: CreateServicioDto })
  @ApiResponse({
    status: 201,
    description: 'Servicio creado correctamente',
    type: Servicio,
  })
  @Post('servicio')
  @Auth()
  crearServicio(@Body() dto: CreateServicioDto): Promise<Servicio> {
    return this.usuarioService.crearServicio(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de servicios',
    type: [Servicio],
  })
  @Get('servicio/all')
  @Auth()
  obtenerServicios(): Promise<Servicio[]> {
    return this.usuarioService.obtenerServicios();
  }

  @ApiOperation({ summary: 'Obtener servicios por incidente' })
  @ApiParam({
    name: 'incidente_id',
    type: Number,
    description: 'ID del incidente',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios asociados al incidente',
    type: [Servicio],
  })
  @Get('servicio/incidente/:incidente_id')
  @Auth()
  obtenerServiciosPorIncidente(
    @Param('incidente_id') incidente_id: string,
  ): Promise<Servicio[]> {
    return this.usuarioService.obtenerServiciosPorIncidente(
      parseInt(incidente_id),
    );
  }
}
