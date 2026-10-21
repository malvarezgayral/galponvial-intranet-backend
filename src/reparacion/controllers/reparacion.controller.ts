// src/reparacion/controllers/reparacion.controller.ts
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
import { ReparacionService } from '../services/reparacion.service';
import { CreateReparacionDto } from '../dto/create-reparacion.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';

@Controller('reparaciones')
export class ReparacionController {
  constructor(private readonly reparacionService: ReparacionService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.REPARACION_WRITE)
  crear(@Body() dto: CreateReparacionDto) {
    return this.reparacionService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.reparacionService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.reparacionService.obtenerUno(id);
  }

  @Put(':id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.REPARACION_WRITE)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReparacionDto,
  ) {
    return this.reparacionService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.reparacionService.eliminar(id);
  }
}
