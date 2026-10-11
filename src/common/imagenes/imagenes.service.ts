import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { FileUpload } from '../interfaces/file.interface';

export const MAX_IMAGEN_BYTES = 10 * 1024 * 1024;

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function getImagenesDir(): string {
  return process.env.IMAGENES_DIR ?? '/home/galponvial/galponvial_imagenes';
}

function detectarExtension(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg';
  }
  const firmaPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(firmaPng)) {
    return 'png';
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

@Injectable()
export class ImagenesService {
  async guardarImagen(file: FileUpload): Promise<string> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('El archivo de imagen está vacío');
    }
    if (file.buffer.length > MAX_IMAGEN_BYTES) {
      throw new BadRequestException(
        'La imagen supera el tamaño máximo de 10 MB',
      );
    }
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
      throw new BadRequestException(
        'Tipo de archivo no permitido: solo se aceptan imágenes JPG, PNG o WEBP',
      );
    }
    const extension = detectarExtension(file.buffer);
    if (!extension) {
      throw new BadRequestException(
        'El archivo no es una imagen válida (JPG, PNG o WEBP)',
      );
    }

    const carpeta = getImagenesDir();
    await mkdir(carpeta, { recursive: true });
    const nombre = randomUUID() + '.' + extension;
    await writeFile(join(carpeta, nombre), file.buffer);

    const prefijo = process.env.API_GLOBAL_PREFIX ?? '';
    return '/' + (prefijo ? prefijo + '/' : '') + 'uploads/' + nombre;
  }
}
