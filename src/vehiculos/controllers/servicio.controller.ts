import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicioService } from '../services/servicio.service';
import { CreateServicioDto } from '../dto/create-servicio.dto';

@Controller('servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  findAll() {
    return this.servicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicioService.findOne(+id);
  }

  @Get('incidente/:idIncidente')
  findByIncidente(@Param('idIncidente') idIncidente: string) {
    return this.servicioService.findByIncidente(+idIncidente);
  }

  @Get('vehiculo/:idVehiculo')
  findByVehiculo(@Param('idVehiculo') idVehiculo: string) {
    return this.servicioService.findByVehiculo(+idVehiculo);
  }
}
