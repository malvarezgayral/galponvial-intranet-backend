// src/compras/controllers/orden-compra.controller.ts
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
import { OrdenCompraService } from '../services/orden-compra.service';
import { CreateOrdenCompraDto } from '../dto/create-orden-compra.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('ordenes-compra')
export class OrdenCompraController {
  constructor(private readonly ordenCompraService: OrdenCompraService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  crear(@Body() dto: CreateOrdenCompraDto) {
    return this.ordenCompraService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.ordenCompraService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.ordenCompraService.obtenerUno(id);
  }

  @Put(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrdenCompraDto,
  ) {
    return this.ordenCompraService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.ordenCompraService.eliminar(id);
  }
}
