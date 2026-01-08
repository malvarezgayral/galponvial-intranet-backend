import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { VehiculosService } from '../services/vehiculo.service';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { CreateRecordatorioDto } from '../dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from '../dto/update-recordatorio.dto';

@Controller('vehiculos')
@Auth(ValidRoles.admin)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Patch(':id/baja')
  @HttpCode(HttpStatus.OK)
  darDeBaja(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.darDeBaja(id);
  }

  @Patch(':id/alta')
  @HttpCode(HttpStatus.OK)
  darDeAlta(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.darDeAlta(id);
  }

  @Post(':id/recordatorios')
  @HttpCode(HttpStatus.CREATED)
  agregarRecordatorio(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRecordatorioDto: CreateRecordatorioDto,
  ) {
    return this.vehiculosService.agregarRecordatorio(id, createRecordatorioDto);
  }

  @Get(':vehiculoId/recordatorios')
  async getRecordatorios(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
  ) {
    return this.vehiculosService.getRecordatoriosByVehiculo(vehiculoId);
  }

  @Patch('recordatorios/:recordatorioId')
  async updateRecordatorio(
    @Param('recordatorioId', ParseIntPipe) recordatorioId: number,
    @Body() dto: UpdateRecordatorioDto,
  ) {
    return this.vehiculosService.updateRecordatorio(recordatorioId, dto);
  }
}
