// src/lubricante-entrada/lubricante-entrada.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LubricanteEntrada } from './entities/lubricante-entrada.entity';
import { LubricanteEntradaService } from './services/lubricante-entrada.service';
import { LubricanteEntradaController } from './controllers/lubricante-entrada.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([LubricanteEntrada]), UsuarioModule],
  controllers: [LubricanteEntradaController],
  providers: [LubricanteEntradaService],
})
export class LubricanteEntradaModule {}
