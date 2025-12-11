import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Vehiculo } from './entities/vehiculo.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { Sector } from './entities/sector.entity';
import { StatusUpdate } from './entities/status-update.entity';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { Servicio } from './entities/servicio.entity';

// Servicios
import { VehiculosService } from './services/vehiculos.service';
import { CombustibleService } from './services/combustible.service';
import { IncidentesService } from './services/incidentes.service';
import { ServiciosService } from './services/servicios.service';

// Controladores
import { VehiculosController } from './controllers/vehiculos.controller';
import { CombustibleController } from './controllers/combustible.controller';
import { IncidentesController } from './controllers/incidentes.controller';
import { ServiciosController } from './controllers/servicios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      CombustibleCarga,
      InfoAdicional,
      Recordatorio,
      Sector,
      StatusUpdate,
      ReporteIncidente,
      Servicio,
    ]),
  ],
  controllers: [
    VehiculosController,
    CombustibleController,
    IncidentesController,
    ServiciosController,
  ],
  providers: [
    VehiculosService,
    CombustibleService,
    IncidentesService,
    ServiciosService,
  ],
  exports: [VehiculosService], // Para usar en otros módulos
})
export class VehiculosModule {}
