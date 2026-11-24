// src/lubricante-entrada/controllers/lubricante-entrada.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LubricanteEntradaService } from '../services/lubricante-entrada.service';
import { CreateLubricanteEntradaDto } from '../dto/create-lubricante-entrada.dto';
import { UpdateLubricanteEntradaDto } from '../dto/update-lubricante-entrada.dto';
import { UpdateLubricanteSalidaDto } from '../dto/update-lubricante-salida.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import { ScopedPermissions } from 'src/usuario/decorators/scoped-permissions.decorator';
import { GetUser } from 'src/usuario/decorators/get-user.decorator';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Permisos, ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('lubricante-entrada')
export class LubricanteEntradaController {
  constructor(private readonly service: LubricanteEntradaService) {}

  @Post()
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  crear(@Body() dto: CreateLubricanteEntradaDto, @GetUser() user: Usuario) {
    return this.service.crear(dto, user);
  }

  @Get('tipos')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTipos() {
    return this.service.obtenerTipos();
  }

  @Get('stock')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerStock() {
    return this.service.obtenerStock();
  }

  @Get('historial')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerHistorial() {
    return this.service.obtenerHistorial();
  }

  /** Listado para Eliminar/Editar Lubricante, con lo que puede hacer el usuario en cada fila. */
  @Get('cargas')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  obtenerCargas(@GetUser() user: Usuario) {
    return this.service.obtenerCargas(user);
  }

  /** El super admin edita cualquiera; un admin, solo las que cargó él. */
  @Put(':id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLubricanteEntradaDto,
    @GetUser() user: Usuario,
  ) {
    return this.service.actualizar(id, dto, user);
  }

  @Patch(':id/salida')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.LUBRICENTRO_WRITE)
  guardarSalida(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLubricanteSalidaDto,
  ) {
    return this.service.guardarSalida(id, dto);
  }

  @Delete('historial/:id')
  @Auth(ValidRoles.superadmin)
  eliminarHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarHistorial(id);
  }

  /** Solo super admin, y solo si la carga no tiene salidas. */
  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
