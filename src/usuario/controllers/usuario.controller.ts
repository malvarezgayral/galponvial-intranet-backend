import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Logger,
  Patch,
  Put,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';
import {
  CreateUsuarioDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
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
import { ObjectServiceResponse } from '../interfaces/object-service-response.interface';
import { DeActivateUserDto } from '../dto/de-activate.dto';

@Controller('usuario')
export class UsuarioController {
  private logger = new Logger(UsuarioController.name);

  constructor(private readonly usuarioService: UsuarioService) {}

  // Usuarios
  @Post('register')
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

  @Get()
  @Auth()
  obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioService.obtenerUsuarios();
  }

  @Get(':dni')
  @Auth()
  obtenerUsuarioPorDni(@Param('dni') dni: number): Promise<Usuario | null> {
    return this.usuarioService.obtenerUsuarioPorDni(dni);
  }

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
    return this.usuarioService.updateUsuario(dni, dto, currentUser.rol.rol);
  }

  // Roles
  @Patch('addRol/:dni')
  @Auth(ValidRoles.admin)
  asignarRol(
    @Param('dni') dni: number,
    @Body() dto: AssignRolDto,
  ): Promise<Rol> {
    return this.usuarioService.addRol(dto, dni);
  }

  // Usuario-Vehiculo
  @Post('asignar-vehiculo')
  @Auth(ValidRoles.admin)
  asignarVehiculo(@Body() dto: CreateUsuarioVehiculoDto) {
    return this.usuarioService.asignarVehiculo(dto);
  }

  @Get(':id_usuario/vehiculos')
  @Auth()
  obtenerVehiculosPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<UsuarioVehiculo[]> {
    return this.usuarioService.obtenerVehiculosPorUsuario(parseInt(id_usuario));
  }

  // Reportes
  @Post('reporte')
  @Auth()
  crearReporte(
    @Body() dto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    return this.usuarioService.crearReporte(dto);
  }

  @Get('reporte/all')
  @Auth()
  obtenerReportes(): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportes();
  }

  @Get(':id_usuario/reportes')
  @Auth()
  obtenerReportesPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportesPorUsuario(parseInt(id_usuario));
  }

  // Servicios
  @Post('servicio')
  @Auth()
  crearServicio(@Body() dto: CreateServicioDto): Promise<Servicio> {
    return this.usuarioService.crearServicio(dto);
  }

  @Get('servicio/all')
  @Auth()
  obtenerServicios(): Promise<Servicio[]> {
    return this.usuarioService.obtenerServicios();
  }

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
