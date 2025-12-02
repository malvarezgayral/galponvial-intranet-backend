import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenController } from './almacen.controller';
import { AlmacenService } from './almacen.service';

describe('AlmacenController', () => {
  let controller: AlmacenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlmacenController],
      providers: [AlmacenService],
    }).compile();

    controller = module.get<AlmacenController>(AlmacenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
