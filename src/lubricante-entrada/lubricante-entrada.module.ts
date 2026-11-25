// src/lubricante-entrada/lubricante-entrada.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LubricanteEntrada } from './entities/lubricante-entrada.entity';
import { LubricanteStockHistorial } from './entities/lubricante-stock-historial.entity';
import { LubricanteTipo } from './entities/lubricante-tipo.entity';
import { LubricanteEntradaService } from './services/lubricante-entrada.service';
import { LubricanteEntradaController } from './controllers/lubricante-entrada.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LubricanteEntrada,
      LubricanteStockHistorial,
      LubricanteTipo,
      Usuario,
    ]),
    UsuarioModule,
    NotificacionesModule,
  ],
  controllers: [LubricanteEntradaController],
  providers: [LubricanteEntradaService],
})
export class LubricanteEntradaModule {}
