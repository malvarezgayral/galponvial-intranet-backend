import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReporteIncidenteService } from '../services/reporte-incidente.service';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';

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
  findAll() {
    return this.reporteIncidenteService.findAll();
  }
}
