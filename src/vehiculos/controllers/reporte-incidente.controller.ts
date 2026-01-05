import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReporteIncidenteService } from '../services/reporte-incidente.service';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { FiltrosIncidenteDto } from '../dto/filtros.dto'; // ← Usar el existente

@Controller('incidentes')
export class ReporteIncidenteController {
  constructor(
    private readonly reporteIncidenteService: ReporteIncidenteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateReporteIncidenteDto) {
    return this.reporteIncidenteService.create(createDto);
  }

  @Get()
  findAll(@Query() filtros: FiltrosIncidenteDto) {
    return this.reporteIncidenteService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reporteIncidenteService.findOne(id);
  }
}