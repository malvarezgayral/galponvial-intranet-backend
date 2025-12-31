import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';
import {
  CreateUsuarioDto,
  CreateRolDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
} from '../dto/usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioVehiculo } from '../entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../entities/reporte-incidente.entity';
import { Servicio } from '../entities/servicio.entity';
import { LoginUserDto } from '../dto/login.dto';

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
  async loginUser(@Body() loginUserDto: LoginUserDto) {
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
  obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioService.obtenerUsuarios();
  }

  @Get(':dni')
  obtenerUsuarioPorDni(@Param('dni') dni: number): Promise<Usuario | null> {
    return this.usuarioService.obtenerUsuarioPorDni(dni);
  }

  // Roles
  @Post('rol')
  crearRol(@Body() dto: CreateRolDto): Promise<Rol> {
    return this.usuarioService.crearRol(dto);
  }

  @Get('rol/all')
  obtenerRoles(): Promise<Rol[]> {
    return this.usuarioService.obtenerRoles();
  }

  // Usuario-Vehiculo
  @Post('asignar-vehiculo')
  asignarVehiculo(@Body() dto: CreateUsuarioVehiculoDto) {
    return this.usuarioService.asignarVehiculo(dto);
  }

  @Get(':id_usuario/vehiculos')
  obtenerVehiculosPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<UsuarioVehiculo[]> {
    return this.usuarioService.obtenerVehiculosPorUsuario(parseInt(id_usuario));
  }

  // Reportes
  @Post('reporte')
  crearReporte(
    @Body() dto: CreateReporteIncidenteDto,
  ): Promise<ReporteIncidente> {
    return this.usuarioService.crearReporte(dto);
  }

  @Get('reporte/all')
  obtenerReportes(): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportes();
  }

  @Get(':id_usuario/reportes')
  obtenerReportesPorUsuario(
    @Param('id_usuario') id_usuario: string,
  ): Promise<ReporteIncidente[]> {
    return this.usuarioService.obtenerReportesPorUsuario(parseInt(id_usuario));
  }

  // Servicios
  @Post('servicio')
  crearServicio(@Body() dto: CreateServicioDto): Promise<Servicio> {
    return this.usuarioService.crearServicio(dto);
  }

  @Get('servicio/all')
  obtenerServicios(): Promise<Servicio[]> {
    return this.usuarioService.obtenerServicios();
  }

  @Get('servicio/incidente/:incidente_id')
  obtenerServiciosPorIncidente(
    @Param('incidente_id') incidente_id: string,
  ): Promise<Servicio[]> {
    return this.usuarioService.obtenerServiciosPorIncidente(
      parseInt(incidente_id),
    );
  }
}
