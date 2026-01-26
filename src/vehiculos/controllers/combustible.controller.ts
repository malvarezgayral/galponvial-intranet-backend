import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CombustibleService } from '../services/combustible.service';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { FiltrosCombustibleDto } from '../dto/filtros.dto';
import { CombustibleCargaResponseDto } from '../dto/combustible-carga-response.dto';

@ApiTags('Vehículos - Combustible')
@Controller('combustible-cargas')
@Auth()
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @ApiOperation({ summary: 'Obtener todas las cargas de combustible' })
  @ApiResponse({
    status: 200,
    description: 'Listado de cargas de combustible',
  })
  @Get()
  findAll() {
    return this.combustibleService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener cargas con métricas de rendimiento',
    description:
      'Lista cargas de combustible con cálculos de recorrido y rendimiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de cargas con métricas',
    type: [CombustibleCargaResponseDto],
  })
  @Get('metricas')
  async findWithMetrics(
    @Query() filtros: FiltrosCombustibleDto,
  ): Promise<CombustibleCargaResponseDto[]> {
    return await this.combustibleService.findWithMetrics(filtros);
  }
}