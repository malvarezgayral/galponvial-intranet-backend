// src/personal/services/personal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentacionPersonal } from '../entities/documentacion-personal.entity';
import { RegistroAdministrativo } from '../entities/registro-administrativo.entity';
import { CreateDocumentacionPersonalDto } from '../dto/create-documentacion-personal.dto';
import { CreateRegistroAdministrativoDto } from '../dto/create-registro-administrativo.dto';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(DocumentacionPersonal)
    private readonly docRepo: Repository<DocumentacionPersonal>,
    @InjectRepository(RegistroAdministrativo)
    private readonly regRepo: Repository<RegistroAdministrativo>,
  ) {}

  // ---------- Documentación personal ----------
  async crearDocumentacion(
    dto: CreateDocumentacionPersonalDto,
  ): Promise<DocumentacionPersonal> {
    const nuevo = this.docRepo.create(dto);
    return this.docRepo.save(nuevo);
  }

  async obtenerDocumentaciones(): Promise<DocumentacionPersonal[]> {
    return this.docRepo.find({ order: { apellido: 'ASC', nombre: 'ASC' } });
  }

  async obtenerDocumentacion(id: number): Promise<DocumentacionPersonal> {
    const item = await this.docRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(
        `Documentación personal con ID ${id} no encontrada`,
      );
    }
    return item;
  }

  async actualizarDocumentacion(
    id: number,
    dto: CreateDocumentacionPersonalDto,
  ): Promise<DocumentacionPersonal> {
    await this.obtenerDocumentacion(id);
    await this.docRepo.update(id, dto);
    return this.obtenerDocumentacion(id);
  }

  async eliminarDocumentacion(id: number): Promise<void> {
    await this.obtenerDocumentacion(id);
    await this.docRepo.delete(id);
  }

  // ---------- Registro administrativo ----------
  async crearRegistro(
    dto: CreateRegistroAdministrativoDto,
  ): Promise<RegistroAdministrativo> {
    const nuevo = this.regRepo.create(dto);
    return this.regRepo.save(nuevo);
  }

  async obtenerRegistros(): Promise<RegistroAdministrativo[]> {
    return this.regRepo.find({ order: { apellido: 'ASC', nombre: 'ASC' } });
  }

  async obtenerRegistro(id: number): Promise<RegistroAdministrativo> {
    const item = await this.regRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(
        `Registro administrativo con ID ${id} no encontrado`,
      );
    }
    return item;
  }

  async actualizarRegistro(
    id: number,
    dto: CreateRegistroAdministrativoDto,
  ): Promise<RegistroAdministrativo> {
    await this.obtenerRegistro(id);
    await this.regRepo.update(id, dto);
    return this.obtenerRegistro(id);
  }

  async eliminarRegistro(id: number): Promise<void> {
    await this.obtenerRegistro(id);
    await this.regRepo.delete(id);
  }
}
