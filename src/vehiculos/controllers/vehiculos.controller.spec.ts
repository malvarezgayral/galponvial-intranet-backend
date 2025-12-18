import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from '../services/vehiculo.service';

describe('VehiculosController', () => {
  let controller: VehiculosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculosController],
      providers: [VehiculosService],
    }).compile();

    controller = module.get<VehiculosController>(VehiculosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
