// src/proveedores/controllers/proveedor.controller.ts
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
import { ProveedorService } from '../services/proveedor.service';
import { CreateProveedorDto } from '../dto/create-proveedor.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('proveedores')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  crear(@Body() dto: CreateProveedorDto) {
    return this.proveedorService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.proveedorService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.obtenerUno(id);
  }

  @Put(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProveedorDto,
  ) {
    return this.proveedorService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.eliminar(id);
  }
}
