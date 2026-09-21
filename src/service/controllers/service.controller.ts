// src/service/controllers/service.controller.ts
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
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.SERVICE_WRITE)
  crear(@Body() dto: CreateServiceDto) {
    return this.serviceService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.serviceService.obtenerTodos();
  }

  @Put(':id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.SERVICE_WRITE)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceDto,
  ) {
    return this.serviceService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.eliminar(id);
  }
}