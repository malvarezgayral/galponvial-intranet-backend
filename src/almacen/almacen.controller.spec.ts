import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenController } from './almacen.controller';
import { AlmacenService } from './almacen.service';

describe('AlmacenController', () => {
  let controller: AlmacenController;

  const mockService = {
    getAllArticles: jest.fn(),
  };

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

  it('should return all articles', async () => {
    mockService.getAllArticles.mockResolvedValue([]);

    const result = await controller.getAllArticles();

    expect(mockService.getAllArticles).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
