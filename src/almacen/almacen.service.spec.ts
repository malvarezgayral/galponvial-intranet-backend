import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenService } from './almacen.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Articulo } from './entities/articulo.entity';
import { GrupoArticulo } from './entities/grupo-articulo.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Entrada } from './entities/entrada.entity';
import { Salida } from './entities/salida.entity';
import { UnidadMedidaCuant } from './entities/unidad-medida-cuant.entity';
import { NotFoundException } from '@nestjs/common';

describe('AlmacenService', () => {
  let service: AlmacenService;

  const articuloRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
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
  const unidadMedidaRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};


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
        { provide: getRepositoryToken(UnidadMedidaCuant), useValue: unidadMedidaRepo },
      ],
    }).compile();

    service = module.get<AlmacenService>(AlmacenService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all articles', async () => {
    articuloRepo.find.mockResolvedValue([{ cod: 1 }]);

    const result = await service.getAllArticles();

    expect(articuloRepo.find).toHaveBeenCalledWith({
      relations: ['grupo', 'unidadMedida'],
    });
    expect(result).toEqual([{ cod: 1 }]);
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
