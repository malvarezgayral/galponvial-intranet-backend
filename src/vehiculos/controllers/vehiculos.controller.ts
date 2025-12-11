import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiculosService } from '../services/vehiculos.service';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('tipo') tipo?: string) {
    if (status) {
      return this.vehiculosService.findByStatus(status as VehiculoStatus);
    }
    if (tipo) {
      return this.vehiculosService.findByTipo(tipo);
    }
    return this.vehiculosService.findAll();
  }

  // ⭐ RUTAS ESPECÍFICAS PRIMERO (sin parámetros dinámicos)
  @Get('estadisticas')
  getEstadisticas() {
    return this.vehiculosService.countByStatus();
  }

  @Get('disponibles/listado')
  getDisponibles() {
    return this.vehiculosService.findByStatus(VehiculoStatus.DISPONIBLE);
  }

  // ⭐ LUEGO RUTAS CON PARÁMETROS ESPECÍFICOS
  @Get(':id/historial')
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.getHistorialCompleto(id);
  }

  @Get(':id/status-history')
  getStatusHistory(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.getStatusHistory(id);
  }

  // ⭐ FINALMENTE RUTAS GENÉRICAS CON :id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Patch(':id/status')
  cambiarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VehiculoStatus,
  ) {
    return this.vehiculosService.cambiarStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.remove(id);
  }
}