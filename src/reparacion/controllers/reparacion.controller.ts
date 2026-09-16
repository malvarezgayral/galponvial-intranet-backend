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
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('reparaciones')
export class ReparacionController {
  constructor(private readonly reparacionService: ReparacionService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
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
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
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
