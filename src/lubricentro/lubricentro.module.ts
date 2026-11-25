// src/lubricentro/lubricentro.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lubricante } from './entities/lubricante.entity';
import { LubricanteTipo } from 'src/lubricante-entrada/entities/lubricante-tipo.entity';
import { LubricanteService } from './services/lubricante.service';
import { LubricanteController } from './controllers/lubricante.controller';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lubricante, LubricanteTipo]), NotificacionesModule],
  controllers: [LubricanteController],
  providers: [LubricanteService],
  exports: [LubricanteService],
})
export class LubricentroModule {}
