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
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createServicioDto: CreateServicioDto,
  ): Promise<ServicioResponseDto> {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  @Auth()
  findAll(): Promise<ServicioResponseDto[]> {
    return this.servicioService.findAll();
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string): Promise<ServicioResponseDto> {
    return this.servicioService.findOne(+id);
  }

  @Get('incidente/:idIncidente')
  @Auth()
  findByIncidente(
    @Param('idIncidente') idIncidente: string,
  ): Promise<ServicioResponseDto[]> {
    return this.servicioService.findByIncidente(+idIncidente);
  }

  @Get('vehiculo/:idVehiculo')
  @Auth()
  findByVehiculo(
    @Param('idVehiculo') idVehiculo: string,
  ): Promise<ServicioResponseDto[]> {
    return this.servicioService.findByVehiculo(+idVehiculo);
  }
}
