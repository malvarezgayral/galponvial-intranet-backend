// src/filtro-service/filtro-service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiltroService } from './entities/filtro-service.entity';
import { FiltroServiceService } from './services/filtro-service.service';
import { FiltroServiceController } from './controllers/filtro-service.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([FiltroService]), UsuarioModule],
  controllers: [FiltroServiceController],
  providers: [FiltroServiceService],
})
export class FiltroServiceModule {}
