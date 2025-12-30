import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import {
  CreateUsuarioDto,
  CreateRolDto,
  CreateUsuarioVehiculoDto,
  CreateReporteIncidenteDto,
  CreateServicioDto,
} from './dto/usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioVehiculo } from './entities/usuario-vehiculo.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Usuarios
  @Post()
  crearUsuario(@Body() dto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.crearUsuario(dto);
  }

  @Get()
  obtenerUsuarios(): Promise<Usuario[]> {
    return this.usuarioService.obtenerUsuarios();
  }

  @Get(':dni')
  obtenerUsuarioPorDni(@Param('dni') dni: string): Promise<Usuario | null> {
    return this.usuarioService.obtenerUsuarioPorDni(parseInt(dni));
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
