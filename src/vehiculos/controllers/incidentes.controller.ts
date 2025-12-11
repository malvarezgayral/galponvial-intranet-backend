import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IncidentesService } from '../services/incidentes.service';
import { CreateIncidenteDto } from '../dto/create-incidente.dto';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { StatusIncidente } from '../enums/vehiculo.enum';

@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateIncidenteDto) {
    return this.incidentesService.create(createDto);
  }

  @Get()
  findAll(@Query() filtros: FiltrosIncidenteDto) {
    return this.incidentesService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidentesService.findOne(id);
  }

  @Patch(':id/status')
  actualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StatusIncidente,
  ) {
    return this.incidentesService.actualizarStatus(id, status);
  }
}