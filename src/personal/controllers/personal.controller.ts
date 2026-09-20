// src/personal/controllers/personal.controller.ts
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
import { PersonalService } from '../services/personal.service';
import { CreateDocumentacionPersonalDto } from '../dto/create-documentacion-personal.dto';
import { CreateRegistroAdministrativoDto } from '../dto/create-registro-administrativo.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { ScopedAuth } from 'src/usuario/decorators/scoped-auth.decorator';
import {
  ScopedPermissions,
  ScopedReadPermissions,
} from 'src/usuario/decorators/scoped-permissions.decorator';
import { ValidRoles, Permisos } from 'src/usuario/enums/usuario.enum';

@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  // ---------- Documentación personal ----------
  @Post('documentacion')
  @ScopedAuth(ValidRoles.admin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  crearDocumentacion(@Body() dto: CreateDocumentacionPersonalDto) {
    return this.personalService.crearDocumentacion(dto);
  }

  @Get('documentacion')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerDocumentaciones() {
    return this.personalService.obtenerDocumentaciones();
  }

  @Get('documentacion/:id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerDocumentacion(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.obtenerDocumentacion(id);
  }

  @Put('documentacion/:id')
  @ScopedAuth(ValidRoles.admin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  actualizarDocumentacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDocumentacionPersonalDto,
  ) {
    return this.personalService.actualizarDocumentacion(id, dto);
  }

  @Delete('documentacion/:id')
  @Auth(ValidRoles.superadmin)
  eliminarDocumentacion(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.eliminarDocumentacion(id);
  }

  // ---------- Registro administrativo ----------
  @Post('registro')
  @ScopedAuth(ValidRoles.admin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  crearRegistro(@Body() dto: CreateRegistroAdministrativoDto) {
    return this.personalService.crearRegistro(dto);
  }

  @Get('registro')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerRegistros() {
    return this.personalService.obtenerRegistros();
  }

  @Get('registro/:id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerRegistro(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.obtenerRegistro(id);
  }

  @Put('registro/:id')
  @ScopedAuth(ValidRoles.admin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  actualizarRegistro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRegistroAdministrativoDto,
  ) {
    return this.personalService.actualizarRegistro(id, dto);
  }

  @Delete('registro/:id')
  @Auth(ValidRoles.superadmin)
  eliminarRegistro(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.eliminarRegistro(id);
  }
}
