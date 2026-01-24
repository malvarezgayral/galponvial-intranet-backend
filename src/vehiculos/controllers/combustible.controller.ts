import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CombustibleService } from '../services/combustible.service';
import { Auth } from 'src/usuario/decorators/auth.decorator';

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
}
