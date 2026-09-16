// src/lubricentro/controllers/lubricante.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LubricanteService } from '../services/lubricante.service';
import { CreateLubricanteDto } from '../dto/create-lubricante.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { ValidRoles, Permisos } from 'src/usuario/enums/usuario.enum';

@Controller('lubricantes')
export class LubricanteController {
  constructor(private readonly lubricanteService: LubricanteService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  crear(@Body() dto: CreateLubricanteDto) {
    return this.lubricanteService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.lubricanteService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.lubricanteService.obtenerUno(id);
  }

  @Put(':id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLubricanteDto,
  ) {
    return this.lubricanteService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.lubricanteService.eliminar(id);
  }
}
