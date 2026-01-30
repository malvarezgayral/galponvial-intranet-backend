import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Patch,
  Put,
  UseGuards,
  Query,
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
  AssignRolDto,
  UpdateUsuarioDto,
} from '../dto/usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import { LoginUserDto } from '../dto/login.dto';
import { Auth } from '../decorators/auth.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { ValidRoles } from '../enums/usuario.enum';
import {
  JwtLoginResponse,
  ObjectServiceResponse,
} from '../interfaces/object-service-response.interface';
import { DeActivateUserDto } from '../dto/de-activate.dto';
import { RefreshAuthGuard } from '../guards/refresh-auth.guard';

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
  ): Promise<ObjectServiceResponse<JwtLoginResponse>> {
    try {
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
  obtenerUsuarios(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<Usuario[]> {
    return this.usuarioService.obtenerUsuarios(page, pageSize);
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

  @Put()
  @Auth(ValidRoles.admin)
  activarDesactivarUsuario(
    @GetUser() currentUser: Usuario,
    @Body() dto: DeActivateUserDto,
  ): Promise<ObjectServiceResponse<Usuario | number>> {
    return this.usuarioService.activarDesactivarUsuario(dto, currentUser.dni);
  }

  @Put(':dni')
  @Auth()
  async updateUsuario(
    @Param('dni') dni: number,
    @GetUser() currentUser: Usuario,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<ObjectServiceResponse<Usuario | null>> {
    const userFirstRole = currentUser.roles?.[0]?.rol ?? ValidRoles.user;
    return this.usuarioService.updateUsuario(dni, dto, userFirstRole);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@GetUser() user: Usuario): Promise<
    ObjectServiceResponse<{
      accessToken: string;
      tokenVersion: number;
      permisos: string[];
      rol: string;
      dni: number;
    }>
  > {
    return this.usuarioService.refreshToken(user.email);
  }

  @Post('logout')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Logout de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Sesión revocada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario no encontrado o no hay sesión activa',
  })
  async logout(
    @Body() u: { email: string },
  ): Promise<ObjectServiceResponse<{ revoked: number }>> {
    try {
      const { email } = u;
      //implementado para que un admin pueda cerrar la sesión de otro usuario
      return await this.usuarioService.logout(email);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioController.logout',
      );
      throw error;
    }
  }

  @Post('self-logout')
  @Auth()
  @ApiOperation({ summary: 'Logout de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Sesión revocada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario no encontrado o no hay sesión activa',
  })
  async selfLogout(
    @GetUser() user: Usuario,
  ): Promise<ObjectServiceResponse<{ revoked: number }>> {
    try {
      //implementado para que un usuario cierre su propia sesión
      return await this.usuarioService.logout(user.email);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown error',
        'UsuarioController.logout',
      );
      throw error;
    }
  }

  // Roles
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
