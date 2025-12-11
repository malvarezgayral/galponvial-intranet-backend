import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CombustibleService } from '../services/combustible.service';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { FiltrosCombustibleDto } from '../dto/filtros.dto';

@Controller('combustible')
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCombustibleCargaDto) {
    return this.combustibleService.create(createDto);
  }

  @Get()
  findAll(@Query() filtros: FiltrosCombustibleDto) {
    return this.combustibleService.findAll(filtros);
  }

  @Get('vehiculo/:id')
  findByVehiculo(@Param('id', ParseIntPipe) id: number) {
    return this.combustibleService.findByVehiculo(id);
  }

  @Get('rendimiento/:id')
  calcularRendimiento(@Param('id', ParseIntPipe) id: number) {
    return this.combustibleService.calcularRendimiento(id);
  }
}