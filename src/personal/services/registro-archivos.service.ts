// src/personal/services/registro-archivos.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync, ReadStream } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { FileUpload } from 'src/common/interfaces/file.interface';
import { RegistroAdministrativo } from '../entities/registro-administrativo.entity';
import { RegistroAdministrativoArchivo } from '../entities/registro-administrativo-archivo.entity';
import {
  detectarTipo,
  getDocumentosPersonalDir,
  MAX_DOCUMENTO_BYTES,
} from './documentos-personal.service';

const TIPOS = [
  'certificacion',
  'aptitud',
  'acto',
  'licencia_anual',
  'licencia_conducir',
];

export interface ArchivoRegistroDto {
  id: number;
  registroId: number;
  tipo: string;
  nombreOriginal: string;
  mimetype: string;
  tamano: number;
  created_at: Date;
}

function aDto(a: RegistroAdministrativoArchivo): ArchivoRegistroDto {
  return {
    id: a.id,
    registroId: a.registroId,
    tipo: a.tipo,
    nombreOriginal: a.nombreOriginal,
    mimetype: a.mimetype,
    tamano: a.tamano,
    created_at: a.created_at,
  };
}

@Injectable()
export class RegistroArchivosService {
  constructor(
    @InjectRepository(RegistroAdministrativoArchivo)
    private readonly archivoRepo: Repository<RegistroAdministrativoArchivo>,
    @InjectRepository(RegistroAdministrativo)
    private readonly regRepo: Repository<RegistroAdministrativo>,
  ) {}

  async listarTodos(): Promise<ArchivoRegistroDto[]> {
    const filas = await this.archivoRepo.find({ order: { id: 'ASC' } });
    return filas.map(aDto);
  }

  async subir(
    registroId: number,
    tipo: string,
    file: FileUpload,
  ): Promise<ArchivoRegistroDto> {
    if (!TIPOS.includes(tipo)) {
      throw new BadRequestException(
        'Tipo de archivo inválido (certificacion, aptitud, acto, licencia_anual o licencia_conducir)',
      );
    }
    const reg = await this.regRepo.findOneBy({ id: registroId });
    if (!reg) {
      throw new NotFoundException(
        `Registro administrativo con ID ${registroId} no encontrado`,
      );
    }
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('El archivo está vacío');
    }
    if (file.buffer.length > MAX_DOCUMENTO_BYTES) {
      throw new BadRequestException('El archivo supera el tamaño máximo de 10 MB');
    }
    const nombreOriginal = Buffer.from(file.originalname || 'archivo', 'latin1')
      .toString('utf8')
      .slice(0, 255);
    const t = detectarTipo(file.buffer, nombreOriginal);
    if (!t) {
      throw new BadRequestException(
        'Formato no permitido: solo se aceptan PDF, JPG, PNG, DOC o DOCX',
      );
    }
    const carpeta = getDocumentosPersonalDir();
    await mkdir(carpeta, { recursive: true, mode: 0o750 });
    const archivo = randomUUID() + '.' + t.ext;
    await writeFile(join(carpeta, archivo), file.buffer, { mode: 0o640 });
    const fila = this.archivoRepo.create({
      registroId,
      tipo,
      nombreOriginal,
      archivo,
      mimetype: t.mime,
      tamano: file.buffer.length,
    });
    return aDto(await this.archivoRepo.save(fila));
  }

  async abrir(id: number): Promise<{
    stream: ReadStream;
    mimetype: string;
    nombreOriginal: string;
    tamano: number;
  }> {
    const a = await this.archivoRepo.findOneBy({ id });
    if (!a) throw new NotFoundException('Archivo no encontrado');
    const ruta = join(getDocumentosPersonalDir(), basename(a.archivo));
    if (!existsSync(ruta)) {
      throw new NotFoundException('El archivo no está en el servidor');
    }
    return {
      stream: createReadStream(ruta),
      mimetype: a.mimetype,
      nombreOriginal: a.nombreOriginal,
      tamano: a.tamano,
    };
  }

  async eliminar(id: number): Promise<void> {
    const a = await this.archivoRepo.findOneBy({ id });
    if (!a) throw new NotFoundException('Archivo no encontrado');
    await this.archivoRepo.delete(id);
    try {
      await unlink(join(getDocumentosPersonalDir(), basename(a.archivo)));
    } catch {
      // si ya no estaba en disco, no hay nada que borrar
    }
  }
}
