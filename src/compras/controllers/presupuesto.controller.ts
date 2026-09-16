// src/compras/controllers/presupuesto.controller.ts
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
import { PresupuestoService } from '../services/presupuesto.service';
import { CreatePresupuestoDto } from '../dto/create-presupuesto.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('presupuestos')
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  crear(@Body() dto: CreatePresupuestoDto) {
    return this.presupuestoService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.presupuestoService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.obtenerUno(id);
  }

  @Put(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePresupuestoDto,
  ) {
    return this.presupuestoService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.presupuestoService.eliminar(id);
  }
}
