// src/notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { NotificacionesService } from './services/notificaciones.service';
import { NotificacionesController } from './controllers/notificaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Usuario])],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}