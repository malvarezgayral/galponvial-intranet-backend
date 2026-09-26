// src/personal/services/personal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentacionPersonal } from '../entities/documentacion-personal.entity';
import { RegistroAdministrativo } from '../entities/registro-administrativo.entity';
import { CreateDocumentacionPersonalDto } from '../dto/create-documentacion-personal.dto';
import { CreateRegistroAdministrativoDto } from '../dto/create-registro-administrativo.dto';
import { NotificacionesService } from 'src/notificaciones/services/notificaciones.service';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(DocumentacionPersonal)
    private readonly docRepo: Repository<DocumentacionPersonal>,
    @InjectRepository(RegistroAdministrativo)
    private readonly regRepo: Repository<RegistroAdministrativo>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // Aviso a superadmin. Si falla, no rompe el guardado.
  private async notificar(
    titulo: string,
    mensaje: string,
    referenciaTipo: string,
    referenciaId: number,
  ): Promise<void> {
    try {
      await this.notificacionesService.crearNotificacionParaSuperadmin(
        'personal',
        titulo,
        mensaje,
        referenciaTipo,
        referenciaId,
      );
    } catch (e) {
      console.error('No se pudo crear la notificación de Personal', e);
    }
  }

  private tituloPersonal(accion: string, partes: string[]): string {
    const TITULO_MAX_PERSONAL = 150;
    const titulo = [accion, ...partes].join(' · ');
    return titulo.length > TITULO_MAX_PERSONAL
      ? titulo.slice(0, TITULO_MAX_PERSONAL - 1) + '…'
      : titulo;
  }

  // ---------- Documentación personal ----------
  async crearDocumentacion(
    dto: CreateDocumentacionPersonalDto,
  ): Promise<DocumentacionPersonal> {
    const nuevo = this.docRepo.create(dto);
    const guardado = await this.docRepo.save(nuevo);
    await this.notificar(
      this.tituloPersonal('Documentación personal cargada', [
        `${guardado.nombre} ${guardado.apellido}`,
      ]),
      'Se cargó un registro de Documentación Personal.',
      'documentacion',
      guardado.id,
    );
    return guardado;
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
    const guardado = await this.regRepo.save(nuevo);
    const partesRegistro = [`${guardado.nombre} ${guardado.apellido}`];
    if (guardado.legajo) {
      partesRegistro.push(`legajo ${guardado.legajo}`);
    }
    await this.notificar(
      this.tituloPersonal('Registro administrativo cargado', partesRegistro),
      'Se cargó un Registro Administrativo.',
      'registro',
      guardado.id,
    );
    return guardado;
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
