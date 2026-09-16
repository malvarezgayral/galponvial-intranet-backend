// src/proveedores/proveedor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { ProveedorService } from './services/proveedor.service';
import { ProveedorController } from './controllers/proveedor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedorController],
  providers: [ProveedorService],
  exports: [ProveedorService],
})
export class ProveedorModule {}
