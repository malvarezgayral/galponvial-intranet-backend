import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiculosService } from '../services/vehiculo.service';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

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
}