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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentacionPersonal,
      RegistroAdministrativo,
      DocumentacionPersonalArchivo,
      RegistroAdministrativoArchivo,
    ]),
    NotificacionesModule,
  ],
  controllers: [PersonalController],
  providers: [PersonalService, DocumentosPersonalService, RegistroArchivosService],
  exports: [PersonalService],
})
export class PersonalModule {}
