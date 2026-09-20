// src/notificaciones/controllers/notificaciones.controller.ts
import { Controller, Get, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificacionesService } from '../services/notificaciones.service';
import { Auth } from '../../usuario/decorators/auth.decorator';
import { ValidRoles } from '../../usuario/enums/usuario.enum';
import { GetUser } from '../../usuario/decorators/get-user.decorator';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get('no-leidas')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  contarNoLeidas(@GetUser() user: Usuario) {
    const esSuperadmin = user.roles.some((r) => r.rol === ValidRoles.superadmin);
    return this.notificacionesService.contarNoLeidasPorTipo(esSuperadmin);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  obtenerPorTipo(@Query('tipo') tipo: string) {
    return this.notificacionesService.obtenerPorTipo(tipo);
  }

  @Patch(':id/leida')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarComoLeida(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.marcarComoLeida(id);
  }
}
