import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CombustibleService } from '../services/combustible.service';
import { CreateCombustibleCargaDto } from '../dto/create-combustible-carga.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';

@ApiTags('Vehículos - Combustible')
@Controller('combustible-cargas')
@Auth()
export class CombustibleController {
  constructor(private readonly combustibleService: CombustibleService) {}

  @ApiOperation({ summary: 'Registrar una carga de combustible' })
  @ApiBody({ type: CreateCombustibleCargaDto })
  @ApiResponse({
    status: 201,
    description: 'Carga de combustible registrada correctamente',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCombustibleCargaDto) {
    return this.combustibleService.create(createDto);
  }

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
