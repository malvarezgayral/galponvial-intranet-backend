// src/lubricentro/lubricentro.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lubricante } from './entities/lubricante.entity';
import { LubricanteService } from './services/lubricante.service';
import { LubricanteController } from './controllers/lubricante.controller';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lubricante]), NotificacionesModule],
  controllers: [LubricanteController],
  providers: [LubricanteService],
  exports: [LubricanteService],
})
export class LubricentroModule {}
