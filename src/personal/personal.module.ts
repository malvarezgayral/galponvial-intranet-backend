// src/personal/personal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentacionPersonal } from './entities/documentacion-personal.entity';
import { RegistroAdministrativo } from './entities/registro-administrativo.entity';
import { DocumentacionPersonalArchivo } from './entities/documentacion-personal-archivo.entity';
import { RegistroAdministrativoArchivo } from './entities/registro-administrativo-archivo.entity';
import { PersonalService } from './services/personal.service';
import { PersonalController } from './controllers/personal.controller';
import { DocumentosPersonalService } from './services/documentos-personal.service';
import { RegistroArchivosService } from './services/registro-archivos.service';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';
import { Notificacion } from 'src/notificaciones/entities/notificacion.entity';
import { Recordatorio } from 'src/vehiculos/entities/recordatorio.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { VencimientosLicenciaService } from './services/vencimientos-licencia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentacionPersonal,
      RegistroAdministrativo,
      DocumentacionPersonalArchivo,
      RegistroAdministrativoArchivo,
      Notificacion,
      Recordatorio,
      Usuario,
    ]),
    NotificacionesModule,
  ],
  controllers: [PersonalController],
  providers: [
    PersonalService,
    DocumentosPersonalService,
    RegistroArchivosService,
    VencimientosLicenciaService,
  ],
  exports: [PersonalService],
})
export class PersonalModule {}
