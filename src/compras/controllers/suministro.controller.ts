// src/compras/controllers/suministro.controller.ts
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
import { SuministroService } from '../services/suministro.service';
import { CreateSuministroDto } from '../dto/create-suministro.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';

@Controller('suministros')
export class SuministroController {
  constructor(private readonly suministroService: SuministroService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  crear(@Body() dto: CreateSuministroDto) {
    return this.suministroService.crear(dto);
  }

  @Get()
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerTodos() {
    return this.suministroService.obtenerTodos();
  }

  @Get(':id')
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superadmin)
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.suministroService.obtenerUno(id);
  }

  @Put(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSuministroDto,
  ) {
    return this.suministroService.actualizar(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.suministroService.eliminar(id);
  }
}
