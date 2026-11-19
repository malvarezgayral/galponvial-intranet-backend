import { RegistroAdministrativo } from 'src/personal/entities/registro-administrativo.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Vehiculo } from './entities/vehiculo.entity';
import { InfoAdicional } from './entities/info-adicional.entity';
import { Jurisdiccion } from './entities/jurisdiccion.entity';
import { Dependencia } from './entities/dependencia.entity';
import { CombustibleCarga } from './entities/combustible-carga.entity';
import { CombustibleCarro } from './entities/combustible-carro.entity';
import { Recordatorio } from './entities/recordatorio.entity';
import { StatusUpdate } from './entities/status-update.entity';
import { ReporteIncidente } from 'src/usuario/entities/reporte-incidente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { UsuarioVehiculo } from 'src/usuario/entities/usuario-vehiculo.entity';
import { Servicio } from 'src/usuario/entities/servicio.entity';

// Módulos externos
import { UsuarioModule } from 'src/usuario/usuario.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

// Servicios
import { VehiculosService } from './services/vehiculo.service';
import { CombustibleService } from './services/combustible.service';
import { CombustibleCarroService } from './services/combustible-carro.service';
import { StatusUpdateService } from './services/status-update.service';
import { ReporteIncidenteService } from './services/reporte-incidente.service';
import { ServicioService } from './services/servicio.service';
import { JurisdiccionesService } from './services/jurisdicciones.service';

// Controladores
import { VehiculosController } from './controllers/vehiculos.controller';
import { CombustibleController } from './controllers/combustible.controller';
import { CombustibleCarroController } from './controllers/combustible-carro.controller';
import { ReporteIncidenteController } from './controllers/reporte-incidente.controller';
import { ServicioController } from './controllers/servicio.controller';
import { JurisdiccionesController } from './controllers/jurisdicciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      InfoAdicional,
      Jurisdiccion,
      Dependencia,
      CombustibleCarga,
      CombustibleCarro,
      Recordatorio,
      StatusUpdate,
      ReporteIncidente,
      Usuario,
      UsuarioVehiculo,
      Servicio,
      RegistroAdministrativo,
    ]),
    UsuarioModule,
    NotificacionesModule,
  ],
  controllers: [
    VehiculosController,
    CombustibleController,
    CombustibleCarroController,
    ReporteIncidenteController,
    ServicioController,
    JurisdiccionesController,
  ],
  providers: [
    VehiculosService,
    CombustibleService,
    CombustibleCarroService,
    StatusUpdateService,
    ReporteIncidenteService,
    ServicioService,
    JurisdiccionesService,
  ],
  exports: [
    VehiculosService,
    CombustibleService,
    StatusUpdateService,
    ReporteIncidenteService,
    ServicioService,
  ],
})
export class VehiculosModule {}
