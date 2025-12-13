import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Vehiculo } from './entities/vehiculo.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { Sector } from './entities/sector.entity';
import { StatusUpdate } from './entities/status-update.entity';

// Controladores
import { VehiculosController } from './controllers/vehiculos.controller';
import { CombustibleController } from './controllers/combustible.controller';
//import { VehiculosService } from './vehiculo.service';

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
  controllers: [VehiculosController, CombustibleController],
  //exports: [VehiculosService], // Para usar en otros módulos
})
export class VehiculosModule {}
