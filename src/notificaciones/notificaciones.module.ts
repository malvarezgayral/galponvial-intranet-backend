// src/notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionLectura } from './entities/notificacion-lectura.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Recordatorio } from 'src/vehiculos/entities/recordatorio.entity';
import { NotificacionesService } from './services/notificaciones.service';
import { NotificacionesController } from './controllers/notificaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, NotificacionLectura, Usuario, Recordatorio])],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}