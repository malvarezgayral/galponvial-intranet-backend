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
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileUpload } from 'src/common/interfaces/file.interface';
import {
  DocumentosPersonalService,
  MAX_DOCUMENTO_BYTES,
} from '../services/documentos-personal.service';
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
import { GetUser } from 'src/usuario/decorators/get-user.decorator';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Controller('personal')
export class PersonalController {
  constructor(
    private readonly personalService: PersonalService,
    private readonly documentosService: DocumentosPersonalService,
  ) {}

  // ---------- Documentación personal ----------
  @Post('documentacion')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  crearDocumentacion(
    @Body() dto: CreateDocumentacionPersonalDto,
    @GetUser() user: Usuario,
  ) {
    return this.personalService.crearDocumentacion(dto, user);
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
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  actualizarDocumentacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDocumentacionPersonalDto,
    @GetUser() user: Usuario,
  ) {
    return this.personalService.actualizarDocumentacion(id, dto, user);
  }

  @Delete('documentacion/:id')
  @Auth(ValidRoles.superadmin)
  eliminarDocumentacion(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.eliminarDocumentacion(id);
  }

  // ---------- Archivos de documentación personal ----------
  @Post('documentacion/:id/archivos')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENTO_BYTES } }),
  )
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  subirArchivoDocumentacion(
    @Param('id', ParseIntPipe) id: number,
    @Body('tipo') tipo: string,
    @UploadedFile() file: FileUpload,
  ) {
    return this.documentosService.subir(id, tipo, file);
  }

  @Get('documentacion-archivos')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  listarArchivosDocumentacion() {
    return this.documentosService.listarTodos();
  }

  @Get('documentacion-archivos/:archivoId')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  async abrirArchivoDocumentacion(
    @Param('archivoId', ParseIntPipe) archivoId: number,
  ): Promise<StreamableFile> {
    const a = await this.documentosService.abrir(archivoId);
    return new StreamableFile(a.stream, {
      type: a.mimetype,
      length: a.tamano,
      disposition: `inline; filename*=UTF-8''${encodeURIComponent(a.nombreOriginal)}`,
    });
  }

  @Delete('documentacion-archivos/:archivoId')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  eliminarArchivoDocumentacion(
    @Param('archivoId', ParseIntPipe) archivoId: number,
  ) {
    return this.documentosService.eliminar(archivoId);
  }

  // ---------- Registro administrativo ----------
  @Post('registro')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  crearRegistro(
    @Body() dto: CreateRegistroAdministrativoDto,
    @GetUser() user: Usuario,
  ) {
    return this.personalService.crearRegistro(dto, user);
  }

  @Get('registro')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerRegistros() {
    return this.personalService.obtenerRegistros();
  }

  @Get('choferes')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  obtenerChoferes() {
    return this.personalService.obtenerChoferes();
  }

  @Get('registro/:id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedReadPermissions(Permisos.PERSONAL_READ, Permisos.PERSONAL_WRITE)
  obtenerRegistro(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.obtenerRegistro(id);
  }

  @Put('registro/:id')
  @ScopedAuth(ValidRoles.admin, ValidRoles.superadmin)
  @ScopedPermissions(Permisos.PERSONAL_WRITE)
  actualizarRegistro(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRegistroAdministrativoDto,
    @GetUser() user: Usuario,
  ) {
    return this.personalService.actualizarRegistro(id, dto, user);
  }

  @Delete('registro/:id')
  @Auth(ValidRoles.superadmin)
  eliminarRegistro(@Param('id', ParseIntPipe) id: number) {
    return this.personalService.eliminarRegistro(id);
  }
}
