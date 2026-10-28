// src/filtro-service/controllers/filtro-service.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { FiltroServiceService } from '../services/filtro-service.service';
import { CreateFiltroServiceDto } from '../dto/create-filtro-service.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('filtro-service')
export class FiltroServiceController {
  constructor(private readonly filtroService: FiltroServiceService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.SERVICE_WRITE)
  crear(@Body() dto: CreateFiltroServiceDto) {
    return this.filtroService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.filtroService.obtenerTodos();
  }
}
