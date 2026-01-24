import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReporteIncidenteService } from '../services/reporte-incidente.service';
import { CreateReporteIncidenteDto } from '../dto/create-reporte-incidente.dto';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

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
  })
  @Get()
  @Auth()
  findAll(@Query() filtros: FiltrosIncidenteDto) {
    return this.reporteIncidenteService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reporteIncidenteService.findOne(id);
  }
}
