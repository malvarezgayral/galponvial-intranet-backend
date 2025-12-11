import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiciosService } from '../services/servicios.service';
import { CreateServicioDto } from '../dto/create-servicio.dto';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateServicioDto) {
    return this.serviciosService.create(createDto);
  }

  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  @Get('vehiculo/:id')
  findByVehiculo(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.findByVehiculo(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.findOne(id);
  }

  @Patch(':id/finalizar')
  finalizarServicio(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.finalizarServicio(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.remove(id);
  }
}