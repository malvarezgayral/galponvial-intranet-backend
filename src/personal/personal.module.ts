// src/personal/personal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentacionPersonal } from './entities/documentacion-personal.entity';
import { RegistroAdministrativo } from './entities/registro-administrativo.entity';
import { PersonalService } from './services/personal.service';
import { PersonalController } from './controllers/personal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentacionPersonal, RegistroAdministrativo]),
  ],
  controllers: [PersonalController],
  providers: [PersonalService],
  exports: [PersonalService],
})
export class PersonalModule {}
