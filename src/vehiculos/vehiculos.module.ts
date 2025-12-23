import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Vehiculo } from './entities/vehiculo.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Sector } from './entities/sector.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { StatusUpdate } from './entities/status-update.entity';

// Servicios
import { VehiculosService } from './services/vehiculo.service';

// Controladores
import { VehiculosController } from './controllers/vehiculos.controller';
import { CombustibleController } from './controllers/combustible.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      InfoAdicional,
      Sector,
      CombustibleCarga,
      Recordatorio,
      StatusUpdate,
    ]),
  ],
  controllers: [VehiculosController, CombustibleController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
