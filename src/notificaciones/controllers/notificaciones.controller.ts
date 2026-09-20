// src/notificaciones/controllers/notificaciones.controller.ts
import { Controller, Get, Patch, Param, Query, ParseIntPipe, ForbiddenException } from '@nestjs/common';
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
  obtenerPorTipo(@Query('tipo') tipo: string, @GetUser() user: Usuario) {
    // Personal es confidencial: solo el superadmin
    if (tipo === 'personal' && !user.roles.some((r) => r.rol === ValidRoles.superadmin)) {
      throw new ForbiddenException('No autorizado');
    }
    return this.notificacionesService.obtenerPorTipo(tipo);
  }

  @Patch('tipo/:tipo/leidas')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarTipoComoLeido(@Param('tipo') tipo: string, @GetUser() user: Usuario) {
    // Personal es confidencial: solo el superadmin
    if (tipo === 'personal' && !user.roles.some((r) => r.rol === ValidRoles.superadmin)) {
      throw new ForbiddenException('No autorizado');
    }
    return this.notificacionesService.marcarTipoComoLeido(tipo);
  }

  @Patch(':id/leida')
  @Auth(ValidRoles.admin, ValidRoles.superadmin)
  marcarComoLeida(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    const esSuperadmin = user.roles.some((r) => r.rol === ValidRoles.superadmin);
    return this.notificacionesService.marcarComoLeida(id, esSuperadmin);
  }
}
