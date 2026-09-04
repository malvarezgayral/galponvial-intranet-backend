import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Patch,
  Put,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsuarioService } from '../services/usuario.service';
import { RolService } from '../services/rol.service';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
  AssignRolDto,
  UpdateUsuarioDto,
} from '../dto/usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
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
import { UsuarioResponseDto } from '../dto/usuario-response.dto';
import { ReporteIncidenteResponseDto } from '../../vehiculos/dto/reporte-incidente-response.dto';
import { ServicioResponseDto } from '../../vehiculos/dto/servicio-response.dto';
import { RecordatorioResponseDto } from '../../vehiculos/dto/recordatorio-response.dto';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  private logger = new Logger(UsuarioController.name);

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly rolService: RolService,
  ) {}

  // ==================== USUARIOS ====================

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o usuario existente',
  })
  @Auth(ValidRoles.superadmin)
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

  @ApiOperation({
    summary: 'Obtener todos los roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de roles con toda su estructura',
    type: [Rol],
  })
  @Get('roles/estructura')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  async getEstructuraRolesConPermisos(): Promise<ObjectServiceResponse<Rol[]>> {
    const roles = await this.rolService.getRoles();

    return {
      success: true,
      data: roles,
      message: 'Roles obtenidos correctamente',
    };
  }

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios',
    type: [UsuarioResponseDto],
  })
  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  obtenerUsuarios(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<UsuarioResponseDto[]> {
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
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':dni')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  obtenerUsuarioPorDni(
    @Param('dni') dni: number,
  ): Promise<UsuarioResponseDto | null> {
    return this.usuarioService.obtenerUsuarioPorDni(dni);
  }

  // ==================== ROLES ====================

  @Put()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  activarDesactivarUsuario(
    @GetUser() currentUser: Usuario,
    @Body() dto: DeActivateUserDto,
  ): Promise<ObjectServiceResponse<Usuario | number>> {
    const userRoles = currentUser.roles?.map((ur) => ur.rol) ?? [];
    return this.usuarioService.activarDesactivarUsuario(
      dto,
      currentUser.dni,
      userRoles,
    );
  }

  @Put(':dni')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  async updateUsuario(
    @Param('dni') dni: number,
    @GetUser() currentUser: Usuario,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<ObjectServiceResponse<Record<string, unknown>>> {
    const userRoles = currentUser.roles?.map((ur) => ur.rol) ?? [];
    return this.usuarioService.updateUsuario(dni, dto, userRoles);
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
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
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
  @Auth(ValidRoles.superadmin)
  asignarRol(
    @Param('dni') dni: number,
    @Body() dto: AssignRolDto,
    @GetUser() currentUser: Usuario,
  ): Promise<Rol> {
    const userRoles = currentUser.roles?.map((ur) => ur.rol) ?? [];
    return this.usuarioService.addRol(dto, dni, userRoles);
  }

  // ==================== USUARIO - VEHÍCULO ====================

  @ApiOperation({ summary: 'Asignar un vehículo a un usuario' })
  @ApiBody({ type: CreateUsuarioVehiculoDto })
  @ApiResponse({
    status: 201,
    description: 'Vehículo asignado al usuario',
  })
  @Post('asignar-vehiculo')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
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
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
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
    type: [ReporteIncidenteResponseDto],
  })
  @Get('reporte/all')
  @Auth()
  obtenerReportes(): Promise<ReporteIncidenteResponseDto[]> {
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
    type: [ReporteIncidenteResponseDto],
  })
  @Get(':id_usuario/reportes')
  @Auth()
  obtenerReportesPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<ReporteIncidenteResponseDto[]> {
    return this.usuarioService.obtenerReportesPorUsuario(parseInt(id_usuario));
  }

  // ==================== SERVICIOS ====================

  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de servicios',
    type: [ServicioResponseDto],
  })
  @Get('servicio/all')
  @Auth()
  obtenerServicios(): Promise<ServicioResponseDto[]> {
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
    type: [ServicioResponseDto],
  })
  @Get('servicio/incidente/:incidente_id')
  @Auth()
  obtenerServiciosPorIncidente(
    @Param('incidente_id') incidente_id: string,
  ): Promise<ServicioResponseDto[]> {
    return this.usuarioService.obtenerServiciosPorIncidente(
      parseInt(incidente_id),
    );
  }

  // ==================== RECORDATORIOS ====================

  @ApiOperation({ summary: 'Crear un recordatorio para un usuario' })
  @ApiParam({
    name: 'dni',
    type: String,
    description: 'DNI del usuario',
  })
  @ApiBody({
    schema: {
      properties: {
        fecha: { type: 'string', example: '2024-02-20T14:30:00.000Z' },
        descripcion: { type: 'string', example: 'Revisar presión de llantas' },
      },
      required: ['fecha', 'descripcion'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Recordatorio creado correctamente',
    type: RecordatorioResponseDto,
  })
  @Post(':dni/recordatorios')
  @HttpCode(HttpStatus.CREATED)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  agregarRecordatorio(
    @Param('dni', ParseIntPipe) dni: number,
    @Body() data: { fecha: Date; descripcion: string },
  ): Promise<RecordatorioResponseDto> {
    return this.usuarioService.agregarRecordatorio(dni, data);
  }

  @ApiOperation({ summary: 'Obtener recordatorios de un usuario' })
  @ApiParam({
    name: 'dni',
    type: String,
    description: 'DNI del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de recordatorios',
    type: [RecordatorioResponseDto],
  })
  @Get(':dni/recordatorios')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getRecordatorios(
    @Param('dni', ParseIntPipe) dni: number,
  ): Promise<RecordatorioResponseDto[]> {
    return this.usuarioService.getRecordatoriosByUsuario(dni);
  }

  @ApiOperation({ summary: 'Actualizar un recordatorio' })
  @ApiParam({
    name: 'recordatorioId',
    type: Number,
    description: 'ID del recordatorio',
  })
  @ApiBody({
    schema: {
      properties: {
        fecha: { type: 'string', example: '2024-02-20T14:30:00.000Z' },
        descripcion: { type: 'string', example: 'Revisar presión de llantas' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio actualizado correctamente',
    type: RecordatorioResponseDto,
  })
  @Patch('recordatorios/:recordatorioId')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  async updateRecordatorio(
    @Param('recordatorioId', ParseIntPipe) recordatorioId: number,
    @Body() dto: { fecha?: Date; descripcion?: string },
  ): Promise<RecordatorioResponseDto> {
    return this.usuarioService.updateRecordatorio(recordatorioId, dto);
  }

  @ApiOperation({ summary: 'Obtener recordatorios paginados de un usuario' })
  @ApiParam({
    name: 'dni',
    type: String,
    description: 'DNI del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de recordatorios',
  })
  @Get(':dni/recordatorios-paginado')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getRecordatoriosPaginado(
    @Param('dni', ParseIntPipe) dni: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<
    ObjectServiceResponse<{
      data: RecordatorioResponseDto[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const result = await this.usuarioService.getRecordatoriosPaginado(
      dni,
      page,
      pageSize,
    );
    return {
      success: true,
      data: result,
      message: `${result.total} recordatorios encontrados`,
    };
  }

  @ApiOperation({ summary: 'Eliminar un recordatorio específico' })
  @ApiParam({
    name: 'recordatorioId',
    type: Number,
    description: 'ID del recordatorio',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Recordatorio no encontrado',
  })
  @Delete('recordatorios/:recordatorioId')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  async deleteRecordatorio(
    @Param('recordatorioId', ParseIntPipe) recordatorioId: number,
  ): Promise<ObjectServiceResponse<{ deleted: number }>> {
    return this.usuarioService.deleteRecordatorio(recordatorioId);
  }

  @ApiOperation({ summary: 'Eliminar todos los recordatorios de un usuario' })
  @ApiParam({
    name: 'dni',
    type: String,
    description: 'DNI del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorios eliminados correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @Delete(':dni/recordatorios')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superadmin)
  async deleteAllRecordatoriosByUsuario(
    @Param('dni', ParseIntPipe) dni: number,
  ): Promise<ObjectServiceResponse<{ deleted: number }>> {
    return this.usuarioService.deleteAllRecordatoriosByUsuario(dni);
  }
}