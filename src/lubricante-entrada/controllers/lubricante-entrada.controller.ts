// src/lubricante-entrada/controllers/lubricante-entrada.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LubricanteEntradaService } from '../services/lubricante-entrada.service';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('lubricante-entrada')
export class LubricanteEntradaController {
  constructor(private readonly service: LubricanteEntradaService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  crear(@Body() dto: CreateLubricanteEntradaDto) {
    return this.service.crear(dto);
  }
}
