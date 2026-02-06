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
import { ServicioResponseDto } from '../dto/servicio-response.dto';

@Controller('servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createServicioDto: CreateServicioDto,
  ): Promise<ServicioResponseDto> {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  findAll(): Promise<ServicioResponseDto[]> {
    return this.servicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ServicioResponseDto> {
    return this.servicioService.findOne(+id);
  }

  @Get('incidente/:idIncidente')
  findByIncidente(
    @Param('idIncidente') idIncidente: string,
  ): Promise<ServicioResponseDto[]> {
    return this.servicioService.findByIncidente(+idIncidente);
  }

  @Get('vehiculo/:idVehiculo')
  findByVehiculo(
    @Param('idVehiculo') idVehiculo: string,
  ): Promise<ServicioResponseDto[]> {
    return this.servicioService.findByVehiculo(+idVehiculo);
  }
}
