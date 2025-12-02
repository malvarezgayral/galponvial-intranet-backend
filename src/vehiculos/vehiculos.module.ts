import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './entities/vehiculo.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { Sector } from './entities/sector.entity';
import { StatusUpdate } from './entities/status-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      CombustibleCarga,
      InfoAdicional,
      Recordatorio,
      Sector,
      StatusUpdate,
    ]),
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
