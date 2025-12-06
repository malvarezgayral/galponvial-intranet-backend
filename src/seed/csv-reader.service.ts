import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CsvReaderService {
  /**
   * Lee un archivo CSV y retorna un array de objetos
   * @param fileName Nombre del archivo CSV (sin extensión)
   * @returns Array de objetos con los datos parseados
   */
  async readCsv(fileName: string): Promise<Record<string, string | number>[]> {
    // Buscar en src/seed/data (desarrollo) o dist/seed/data (producción)
    let filePath = path.join(__dirname, 'data', `${fileName}.csv`);

    // Si no existe en dist, buscar en src
    if (!fs.existsSync(filePath)) {
      filePath = path.join(
        process.cwd(),
        'src',
        'seed',
        'data',
        `${fileName}.csv`,
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo CSV no encontrado: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');

    if (lines.length < 2) {
      return [];
    }

    // Primera línea contiene los encabezados
    const headers = lines[0].split(',').map((h) => h.trim());

    // Parsear datos
    const data = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const obj: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Intentar convertir a número si es posible
        obj[header] = isNaN(Number(value)) ? value : Number(value);
      });

      return obj;
    });

    return data;
  }

  /**
   * Valida que el archivo CSV exista
   */
  csvExists(fileName: string): boolean {
    let filePath = path.join(__dirname, 'data', `${fileName}.csv`);

    // Si no existe en dist, buscar en src
    if (!fs.existsSync(filePath)) {
      filePath = path.join(
        process.cwd(),
        'src',
        'seed',
        'data',
        `${fileName}.csv`,
      );
    }

    return fs.existsSync(filePath);
  }
}
