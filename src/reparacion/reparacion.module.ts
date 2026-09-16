// src/reparacion/reparacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reparacion } from './entities/reparacion.entity';
import { ReparacionService } from './services/reparacion.service';
import { ReparacionController } from './controllers/reparacion.controller';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reparacion]), NotificacionesModule],
  controllers: [ReparacionController],
  providers: [ReparacionService],
  exports: [ReparacionService],
})
export class ReparacionModule {}
