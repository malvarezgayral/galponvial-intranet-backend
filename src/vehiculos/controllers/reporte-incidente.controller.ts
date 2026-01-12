import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
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

  @ApiOperation({ summary: 'Crear un reporte de incidente' })
  @ApiBody({ type: CreateReporteIncidenteDto })
  @ApiResponse({
    status: 201,
    description: 'Reporte de incidente creado correctamente',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateReporteIncidenteDto) {
    return this.reporteIncidenteService.create(createDto);
  }

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
  findAll(@Body() filtros: FiltrosIncidenteDto) {
    return this.reporteIncidenteService.findAll(filtros);
  }
}
