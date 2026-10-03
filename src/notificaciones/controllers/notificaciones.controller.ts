// src/notificaciones/controllers/notificaciones.controller.ts
import { Controller, Get, Patch, Delete, Param, Query, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { NotificacionesService } from '../services/notificaciones.service';
import { Auth } from '../../usuario/decorators/auth.decorator';
import { ValidRoles } from '../../usuario/enums/usuario.enum';
import { GetUser } from '../../usuario/decorators/get-user.decorator';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { VistaAvisos } from '../services/notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  private vista(user: Usuario): VistaAvisos {
    return {
      dni: Number(user.dni),
      esSuperadmin: (user.roles ?? []).some(
        (r) => r.rol === ValidRoles.superadmin,
      ),
    };
  }

  @Get('no-leidas')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  contarNoLeidas(@GetUser() user: Usuario) {
    return this.notificacionesService.contarNoLeidasPorTipo(
      this.notificacionesService.tiposPermitidos(user.roles),
      this.vista(user),
    );
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  obtenerPorTipo(@Query('tipo') tipo: string, @GetUser() user: Usuario) {
    if (!this.notificacionesService.tiposPermitidos(user.roles).has(tipo)) {
      throw new ForbiddenException('No autorizado');
    }
    return this.notificacionesService.obtenerPorTipo(tipo, this.vista(user));
  }

  @Patch('tipo/:tipo/leidas')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarTipoComoLeido(@Param('tipo') tipo: string, @GetUser() user: Usuario) {
    if (!this.notificacionesService.tiposPermitidos(user.roles).has(tipo)) {
      throw new ForbiddenException('No autorizado');
    }
    return this.notificacionesService.marcarTipoComoLeido(tipo, this.vista(user));
  }

  @Patch(':id/leida')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarComoLeida(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    return this.notificacionesService.marcarComoLeida(
      id,
      this.notificacionesService.tiposPermitidos(user.roles),
      this.vista(user),
    );
  }

  @Delete(':id')
  @Auth(ValidRoles.superadmin)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.eliminar(id);
  }
}
