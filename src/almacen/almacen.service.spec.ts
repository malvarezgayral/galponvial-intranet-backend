import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenService } from './almacen.service';

describe('AlmacenService', () => {
  let service: AlmacenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlmacenService],
    }).compile();

    service = module.get<AlmacenService>(AlmacenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
