import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ObjectServiceResponse } from 'src/usuario/interfaces/object-service-response.interface';
import {
  JurisdiccionesService,
  JurisdiccionConDependencias,
} from '../services/jurisdicciones.service';

@ApiTags('Jurisdicciones')
@Controller('jurisdicciones')
export class JurisdiccionesController {
  constructor(private readonly jurisdiccionesService: JurisdiccionesService) {}

  @ApiOperation({ summary: 'Jurisdicciones del Municipio con sus dependencias' })
  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth()
  async listar(): Promise<ObjectServiceResponse<JurisdiccionConDependencias[]>> {
    const data = await this.jurisdiccionesService.listarConDependencias();
    return {
      success: true,
      data,
      message: 'Jurisdicciones obtenidas correctamente',
    };
  }
}
