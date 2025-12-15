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
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { VehiculoStatus } from '../enums/vehiculo.enum';

@Controller('vehiculos')
export class VehiculosController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVehiculoDto: CreateVehiculoDto) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('tipo') tipo?: string) {}

  @Get('estadisticas')
  getEstadisticas() {}

  @Get('disponibles/listado')
  getDisponibles() {}

  @Get(':id/historial')
  getHistorial(@Param('id', ParseIntPipe) id: number) {}

  @Get(':id/status-history')
  getStatusHistory(@Param('id', ParseIntPipe) id: number) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {}

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {}

  @Patch(':id/status')
  cambiarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VehiculoStatus,
  ) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {}
}
