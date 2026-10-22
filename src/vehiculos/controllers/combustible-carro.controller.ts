import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CombustibleCarroService } from '../services/combustible-carro.service';
import { CreateCombustibleCarroDto } from '../dto/create-combustible-carro.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';

@ApiTags('Vehículos - Combustible Carro')
@Controller('combustible-carro')
export class CombustibleCarroController {
  constructor(private readonly carroService: CombustibleCarroService) {}

  @ApiOperation({ summary: 'Registrar una carga de combustible (Carro)' })
  @ApiBody({ type: CreateCombustibleCarroDto })
  @ApiResponse({ status: 201, description: 'Carga registrada correctamente' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.COMBUSTIBLE_CARRO_WRITE)
  create(@Body() dto: CreateCombustibleCarroDto) {
    return this.carroService.create(dto);
  }

  @ApiOperation({ summary: 'Listar cargas de combustible (Carro)' })
  @ApiResponse({ status: 200, description: 'Listado de cargas (Carro)' })
  @Get()
  @Auth()
  findAll() {
    return this.carroService.findAll();
  }
}
