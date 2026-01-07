import { CsvReaderService } from '../../src/seed/csv-reader.service';

describe('CsvReaderService', () => {
  let service: CsvReaderService;

  beforeEach(() => {
    service = new CsvReaderService();
  });

  it('debería leer un CSV válido', async () => {
    const result = await service.readCsv('articulos');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(Object);
  });

  it('debería lanzar error si el CSV no existe', async () => {
    await expect(service.readCsv('archivo_que_no_existe')).rejects.toThrow(
      'Archivo CSV no encontrado',
    );
  });

  it('csvExists debería retornar true si existe', () => {
    expect(service.csvExists('articulos')).toBe(true);
  });

  it('csvExists debería retornar false si no existe', () => {
    expect(service.csvExists('no_existe')).toBe(false);
  });
});
