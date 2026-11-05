// src/mensajes-privados/controllers/mensajes-privados.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { MensajesPrivadosService } from '../services/mensajes-privados.service';
import { CreateMensajePrivadoDto } from '../dto/create-mensaje-privado.dto';
import { Auth } from 'src/usuario/decorators/auth.decorator';
import { GetUser } from 'src/usuario/decorators/get-user.decorator';
import { ValidRoles } from 'src/usuario/enums/usuario.enum';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Controller('mensajes-privados')
export class MensajesPrivadosController {
  constructor(private readonly service: MensajesPrivadosService) {}

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
}
