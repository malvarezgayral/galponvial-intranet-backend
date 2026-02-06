import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReporteIncidenteService } from '../services/reporte-incidente.service';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';

@ApiTags('Vehículos - Incidentes')
@Controller('incidentes')
@Auth(ValidRoles.admin, ValidRoles.superUser)
export class ReporteIncidenteController {
  constructor(
    private readonly reporteIncidenteService: ReporteIncidenteService,
  ) {}

  @ApiOperation({ summary: 'Obtener reportes de incidentes con filtros' })
  @ApiBody({
    description: 'Filtros de búsqueda de incidentes',
    type: FiltrosIncidenteDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de incidentes',
    type: [ReporteIncidenteResponseDto],
  })
  @Get()
  @Auth()
  findAll(
    @Query() filtros: FiltrosIncidenteDto,
  ): Promise<ReporteIncidenteResponseDto[]> {
    return this.reporteIncidenteService.findAll(filtros);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReporteIncidenteResponseDto> {
    return this.reporteIncidenteService.findOne(id);
  }
}
