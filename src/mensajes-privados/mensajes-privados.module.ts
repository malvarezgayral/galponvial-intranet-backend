// src/mensajes-privados/mensajes-privados.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajePrivado } from './entities/mensaje-privado.entity';
import { MensajesPrivadosService } from './services/mensajes-privados.service';
import { MensajesPrivadosController } from './controllers/mensajes-privados.controller';
import { Notificacion } from 'src/notificaciones/entities/notificacion.entity';
import { NotificacionLectura } from 'src/notificaciones/entities/notificacion-lectura.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MensajePrivado, Notificacion, NotificacionLectura, Usuario]),
    UsuarioModule,
    NotificacionesModule,
  ],
  controllers: [MensajesPrivadosController],
  providers: [MensajesPrivadosService],
})
export class MensajesPrivadosModule {}
