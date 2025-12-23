import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Vehiculo } from './entities/vehiculo.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Sector } from './entities/sector.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { StatusUpdate } from './entities/status-update.entity';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity'; 
import { Usuario } from 'src/usuario/entities/usuario.entity'; 

// Módulos externos
import { UsuarioModule } from 'src/usuario/usuario.module';

// Servicios
import { VehiculosService } from './services/vehiculo.service';
import { CombustibleService } from './services/combustible.service';
import { StatusUpdateService } from './services/status-update.service'; 
import { ReporteIncidenteService } from './services/reporte-incidente.service'; 

// Controladores
import { VehiculosController } from './controllers/vehiculos.controller';
import { CombustibleController } from './controllers/combustible.controller';
import { ReporteIncidenteController } from './controllers/reporte-incidente.controller'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      InfoAdicional,
      Sector,
      CombustibleCarga,
      Recordatorio,
      StatusUpdate,
      ReporteIncidente, 
      Usuario, 
    ]),
    UsuarioModule,
  ],
  controllers: [
    VehiculosController,
    CombustibleController,
    ReporteIncidenteController, 
  ],
  providers: [
    VehiculosService,
    CombustibleService,
    StatusUpdateService, 
    ReporteIncidenteService, 
  ],
  exports: [
    VehiculosService,
    CombustibleService,
    StatusUpdateService, 
    ReporteIncidenteService, 
  ],
})
export class VehiculosModule {}
