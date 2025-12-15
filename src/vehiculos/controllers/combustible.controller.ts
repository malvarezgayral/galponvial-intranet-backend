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
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { FiltrosCombustibleDto } from '../dto/filtros.dto';

@Controller('combustible')
export class CombustibleController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCombustibleCargaDto) {}

  @Get()
  findAll(@Query() filtros: FiltrosCombustibleDto) {}

  @Get('vehiculo/:id')
  findByVehiculo(@Param('id', ParseIntPipe) id: number) {}

  @Get('rendimiento/:id')
  calcularRendimiento(@Param('id', ParseIntPipe) id: number) {}
}
