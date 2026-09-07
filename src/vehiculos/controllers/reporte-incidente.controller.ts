import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReporteIncidenteService } from '../services/reporte-incidente.service';
import { FiltrosIncidenteDto } from '../dto/filtros.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { ReporteIncidenteResponseDto } from '../dto/reporte-incidente-response.dto';
import { UpdateEstadoIncidenteDto } from '../dto/update-estado-incidente.dto';
import { ObjectServiceResponse } from 'src/usuario/interfaces/object-service-response.interface';

@ApiTags('Vehículos - Incidentes')
@Controller('incidentes')
@Auth()
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

  @ApiOperation({ summary: 'Actualizar estado de un incidente' })
  @ApiBody({
    description: 'Nuevo estado del incidente',
    type: UpdateEstadoIncidenteDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Incidente actualizado exitosamente',
  })
  @Patch(':id/estado')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoIncidenteDto,
  ): Promise<ObjectServiceResponse<ReporteIncidenteResponseDto>> {
    return this.reporteIncidenteService.actualizarEstadoIncidente(
      id,
      updateEstadoDto.estado,
    );
  }
}
