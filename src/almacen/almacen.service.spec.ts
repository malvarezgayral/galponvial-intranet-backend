import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenService } from './almacen.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Articulo } from './entities/articulo.entity';
import { GrupoArticulo } from './entities/grupo-articulo.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Entrada } from './entities/entrada.entity';
import { Salida } from './entities/salida.entity';
import { SectorGalpon } from './entities/sector-galpon.entity';
import { UnidadMedidaCuant } from './entities/unidad-medida-cuant.entity';
import { NotFoundException } from '@nestjs/common';
import { Permisos } from '../usuario/enums/usuario.enum';

describe('AlmacenService', () => {
  let service: AlmacenService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const articuloRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const grupoRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const movimientoRepo = { find: jest.fn() };
  const entradaRepo = { findOne: jest.fn() };
  const salidaRepo = { findOne: jest.fn() };
  const unidadRepo = { findOne: jest.fn() };
  const sectorGalponRepo = { findOne: jest.fn() };

  const dataSourceMock = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlmacenService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(Articulo), useValue: articuloRepo },
        { provide: getRepositoryToken(GrupoArticulo), useValue: grupoRepo },
        { provide: getRepositoryToken(Movimiento), useValue: movimientoRepo },
        { provide: getRepositoryToken(Entrada), useValue: entradaRepo },
        { provide: getRepositoryToken(Salida), useValue: salidaRepo },
        { provide: getRepositoryToken(UnidadMedidaCuant), useValue: unidadRepo },
        { provide: getRepositoryToken(SectorGalpon), useValue: sectorGalponRepo },
      ],
    }).compile();

    service = module.get<AlmacenService>(AlmacenService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all articles without permissions filter', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      [{ cod: 1 }],
      1,
    ]);

    const result = await service.getAllArticles(1, 10);

    expect(articuloRepo.createQueryBuilder).toHaveBeenCalledWith('articulo');
    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result.data).toEqual([{ cod: 1 }]);
    expect(result.total).toBe(1);
  });

  it('should filter articles by almacen-taller permission', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      [{ cod: 1 }],
      1,
    ]);

    const result = await service.getAllArticles(1, 10, [
      Permisos.ALMACEN_TALLER_READ,
    ]);

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'sector.tipo IN (:...sectorTypes)',
      {
        sectorTypes: ['almacen-taller'],
      },
    );
    expect(result.total).toBe(1);
  });

  it('should return all articles with all:read permission', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      [{ cod: 1 }, { cod: 2 }],
      2,
    ]);

    const result = await service.getAllArticles(1, 10, [Permisos.ALL_READ]);

    // andWhere debe ser llamado 0 veces porque tiene permisos ALL
    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result.total).toBe(2);
  });

  it('should throw NotFoundException if article does not exist', async () => {
    articuloRepo.findOne.mockResolvedValue(null);

    await expect(service.updateArticle(999, {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete article successfully', async () => {
    articuloRepo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.deleteArticle(1);

    expect(result).toBe(true);
  });

  it('should return group dto', async () => {
    grupoRepo.findOne.mockResolvedValue({
      id: 1,
      nombre: 'Grupo',
      descripcion: 'desc',
      sector: { nro_sector: 5 },
    });

    articuloRepo.find.mockResolvedValue([
      {
        cod: 1,
        cod_proveedor: 'A1',
        nombre: 'Articulo',
        modelo: '',
        descripcion: '',
        img_url: '',
        unidad_tipo: 'kg',
      },
    ]);

    const result = await service.getGroup(1);

    expect(result.id).toBe(1);
    expect(result.sector_galpon).toBe(5);
    expect(result.articulos.length).toBe(1);
  });
});
