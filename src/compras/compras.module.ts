// src/compras/compras.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presupuesto } from './entities/presupuesto.entity';
import { Suministro } from './entities/suministro.entity';
import { SuministroItem } from './entities/suministro-item.entity';
import { OrdenCompra } from './entities/orden-compra.entity';
import { PresupuestoService } from './services/presupuesto.service';
import { SuministroService } from './services/suministro.service';
import { OrdenCompraService } from './services/orden-compra.service';
import { PresupuestoController } from './controllers/presupuesto.controller';
import { SuministroController } from './controllers/suministro.controller';
import { OrdenCompraController } from './controllers/orden-compra.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Presupuesto,
      Suministro,
      SuministroItem,
      OrdenCompra,
    ]),
  ],
  controllers: [
    PresupuestoController,
    SuministroController,
    OrdenCompraController,
  ],
  providers: [PresupuestoService, SuministroService, OrdenCompraService],
  exports: [PresupuestoService, SuministroService, OrdenCompraService],
})
export class ComprasModule {}
