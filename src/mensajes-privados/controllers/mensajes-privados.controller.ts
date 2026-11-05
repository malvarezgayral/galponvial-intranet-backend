// src/mensajes-privados/controllers/mensajes-privados.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MensajesPrivadosService } from '../services/mensajes-privados.service';
import { CreateMensajePrivadoDto } from '../dto/create-mensaje-privado.dto';
import { EnviarChatDto } from '../dto/enviar-chat.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { GetUser } from 'src/usuario/decorators/get-user.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Controller('mensajes-privados')
export class MensajesPrivadosController {
  constructor(private readonly service: MensajesPrivadosService) {}

  // ---------- Mensajes ----------

  // Solo los admin le escriben al superadmin
  @Post()
  @Auth(ValidRoles.admin)
  crear(@Body() dto: CreateMensajePrivadoDto, @GetUser() user: Usuario) {
    return this.service.crearMensaje(user, dto);
  }

  // Cada admin ve solo los suyos
  @Get('mios')
  @Auth(ValidRoles.admin)
  mios(@GetUser() user: Usuario) {
    return this.service.misMensajes(Number(user.dni));
  }

  // ---------- Chat (las rutas fijas van antes que chat/:dni) ----------

  @Get('chat/no-leidos')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  chatNoLeidos(@GetUser() user: Usuario) {
    return this.service.chatNoLeidos(user);
  }

  @Get('chat/admins')
  @Auth(ValidRoles.superadmin)
  chatAdmins() {
    return this.service.listarAdminsChat();
  }

  @Get('chat')
  @Auth(ValidRoles.admin)
  chatDelAdmin(@GetUser() user: Usuario) {
    return this.service.chatDelAdmin(user);
  }

  @Post('chat')
  @Auth(ValidRoles.admin)
  escribirComoAdmin(@Body() dto: EnviarChatDto, @GetUser() user: Usuario) {
    return this.service.escribirComoAdmin(user, dto.texto);
  }

  @Get('chat/:dni')
  @Auth(ValidRoles.superadmin)
  chatConAdmin(@Param('dni', ParseIntPipe) dni: number) {
    return this.service.chatConAdmin(dni);
  }

  @Post('chat/:dni')
  @Auth(ValidRoles.superadmin)
  escribirComoSuperadmin(
    @Param('dni', ParseIntPipe) dni: number,
    @Body() dto: EnviarChatDto,
    @GetUser() user: Usuario,
  ) {
    return this.service.escribirComoSuperadmin(user, dni, dto.texto);
  }

  // ---------- Bandeja de Mensajes ----------

  @Get('bandeja')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  bandeja(@GetUser() user: Usuario) {
    return this.service.bandeja(user);
  }

  // El superadmin le escribe a un admin elegido
  @Post('para/:dni')
  @Auth(ValidRoles.superadmin)
  enviarAAdmin(
    @Param('dni', ParseIntPipe) dni: number,
    @Body() dto: CreateMensajePrivadoDto,
    @GetUser() user: Usuario,
  ) {
    return this.service.enviarAAdmin(user, dni, dto);
  }

  @Patch(':id/leido')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarLeido(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    return this.service.marcarLeido(user, id);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  ocultar(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    return this.service.ocultar(user, id);
  }
}
