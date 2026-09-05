// src/notificaciones/controllers/notificaciones.controller.ts
import { Controller, Get, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificacionesService } from '../services/notificaciones.service';
import { Auth } from '../../usuario/decorators/auth.decorator';
import { ValidRoles } from '../../usuario/enums/usuario.enum';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

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
