// src/personal/services/documentos-personal.service.ts
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
import { DocumentacionPersonal } from '../entities/documentacion-personal.entity';
import { DocumentacionPersonalArchivo } from '../entities/documentacion-personal-archivo.entity';

export const MAX_DOCUMENTO_BYTES = 10 * 1024 * 1024;
const TIPOS = ['dni', 'cuil', 'certificado'];

// Carpeta PRIVADA: no se publica con useStaticAssets
export function getDocumentosPersonalDir(): string {
  return (
    process.env.DOCUMENTOS_PERSONAL_DIR ??
    '/home/galponvial/galponvial_documentos_personal'
  );
}

export interface ArchivoPersonalDto {
  id: number;
  documentacionId: number;
  tipo: string;
  nombreOriginal: string;
  mimetype: string;
  tamano: number;
  created_at: Date;
}

function aDto(a: DocumentacionPersonalArchivo): ArchivoPersonalDto {
  return {
    id: a.id,
    documentacionId: a.documentacionId,
    tipo: a.tipo,
    nombreOriginal: a.nombreOriginal,
    mimetype: a.mimetype,
    tamano: a.tamano,
    created_at: a.created_at,
  };
}

// Se decide por el contenido real del archivo, no por lo que dice el navegador
function detectarTipo(
  buf: Buffer,
  nombre: string,
): { ext: string; mime: string } | null {
  const n = nombre.toLowerCase();
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(png)) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-') {
    return { ext: 'pdf', mime: 'application/pdf' };
  }
  const ole = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(ole) && n.endsWith('.doc')) {
    return { ext: 'doc', mime: 'application/msword' };
  }
  const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  if (
    buf.length >= 4 &&
    buf.subarray(0, 4).equals(zip) &&
    n.endsWith('.docx') &&
    buf.includes('word/')
  ) {
    return {
      ext: 'docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }
  return null;
}

@Injectable()
export class DocumentosPersonalService {
  constructor(
    @InjectRepository(DocumentacionPersonalArchivo)
    private readonly archivoRepo: Repository<DocumentacionPersonalArchivo>,
    @InjectRepository(DocumentacionPersonal)
    private readonly docRepo: Repository<DocumentacionPersonal>,
  ) {}

  async listarTodos(): Promise<ArchivoPersonalDto[]> {
    const filas = await this.archivoRepo.find({ order: { id: 'ASC' } });
    return filas.map(aDto);
  }

  async subir(
    documentacionId: number,
    tipo: string,
    file: FileUpload,
  ): Promise<ArchivoPersonalDto> {
    if (!TIPOS.includes(tipo)) {
      throw new BadRequestException(
        'Tipo de archivo inválido (debe ser dni, cuil o certificado)',
      );
    }
    const doc = await this.docRepo.findOneBy({ id: documentacionId });
    if (!doc) {
      throw new NotFoundException(
        `Documentación personal con ID ${documentacionId} no encontrada`,
      );
    }
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('El archivo está vacío');
    }
    if (file.buffer.length > MAX_DOCUMENTO_BYTES) {
      throw new BadRequestException('El archivo supera el tamaño máximo de 10 MB');
    }
    // multer entrega el nombre en latin1; se pasa a UTF-8 para conservar acentos
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
      documentacionId,
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
