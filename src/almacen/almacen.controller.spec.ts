import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenController } from './almacen.controller';
import { AlmacenService } from './almacen.service';
import { Permisos } from '../usuario/enums/usuario.enum';

describe('AlmacenController', () => {
  let controller: AlmacenController;

  const mockService = {
    getAllArticles: jest.fn(),
  };

  const mockUser = {
    dni: 12345678,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    password: 'hashed_password',
    isActive: true,
    tokenVersion: 0,
    fecha_alta: new Date('2024-01-01'),
    fecha_baja: null,
    roles: [
      {
        id: 1,
        rol: 'user',
        permisos: [Permisos.ALMACEN_TALLER_READ, Permisos.ALMACEN_TALLER_WRITE],
      },
    ],
    vehiculos: [],
    reportesIncidentes: [],
    refreshToken: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlmacenController],
      providers: [
        {
          provide: AlmacenService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AlmacenController>(AlmacenController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all articles with pagination and pass user permissions', async () => {
    mockService.getAllArticles.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const result = await controller.getAllArticles(1, 10, mockUser as any);

    expect(mockService.getAllArticles).toHaveBeenCalledWith(
      1,
      10,
      [Permisos.ALMACEN_TALLER_READ, Permisos.ALMACEN_TALLER_WRITE],
    );
    expect(result.success).toBe(true);
  });

  it('should pass all permissions to service when user has all:read', async () => {
    const userWithAllPermissions = {
      ...mockUser,
      roles: [
        {
          id: 12,
          rol: 'admin',
          permisos: [Permisos.ALL_READ, Permisos.ALL_WRITE],
        },
      ],
    };

    mockService.getAllArticles.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    await controller.getAllArticles(1, 10, userWithAllPermissions as any);

    expect(mockService.getAllArticles).toHaveBeenCalledWith(
      1,
      10,
      [Permisos.ALL_READ, Permisos.ALL_WRITE],
    );
  });
});
