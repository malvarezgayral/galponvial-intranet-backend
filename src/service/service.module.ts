// src/service/service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceService } from './services/service.service';
import { ServiceController } from './controllers/service.controller';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), NotificacionesModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}