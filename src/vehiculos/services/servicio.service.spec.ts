import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServicioService } from './servicio.service';
import { VehiculosService } from './vehiculo.service';
import { ReporteIncidenteService } from './reporte-incidente.service';
import { StatusUpdateService } from './status-update.service';
import { Servicio } from 'src/usuario/entities/servicio.entity';
import { VehiculoStatus } from '../enums/vehiculo.enum';
import { BadRequestException } from '@nestjs/common';

const mockServicioRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockVehiculosService = {
  findOne: jest.fn(),
  updateStatus: jest.fn(),
};

const mockReporteIncidenteService = {
  findOne: jest.fn(),
  marcarEnTratamiento: jest.fn(),
};

const mockStatusUpdateService = {
  crearStatusUpdate: jest.fn(),
};

describe('ServicioService', () => {
  let service: ServicioService;
  let vehiculosService: typeof mockVehiculosService;
  let incidenteService: typeof mockReporteIncidenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioService,
        {
          provide: getRepositoryToken(Servicio),
          useValue: mockServicioRepository,
        },
        { provide: VehiculosService, useValue: mockVehiculosService },
        { provide: ReporteIncidenteService, useValue: mockReporteIncidenteService },
        { provide: StatusUpdateService, useValue: mockStatusUpdateService },
      ],
    }).compile();

    service = module.get<ServicioService>(ServicioService);
    vehiculosService = module.get(VehiculosService);
    incidenteService = module.get(ReporteIncidenteService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un servicio vinculado a un incidente y actualizar estados (Happy Path)', async () => {
      // DATOS DE PRUEBA
      const dto = {
        incidente_id: 1,
        tipo: 'Mecánica',
        fecha_inicio: '2023-10-10',
        descripcion: 'Reparación freno',
      };

      const mockIncidente = { id: 1, id_vehiculo: 100 };
      const mockVehiculo = { id_vehiculo: 100, status: VehiculoStatus.DISPONIBLE };
      const mockServicioGuardado = { id: 50, ...dto };

      // CONFIGURACIÓN DE MOCKS (STUBS)
      incidenteService.findOne.mockResolvedValue(mockIncidente);
      vehiculosService.findOne.mockResolvedValue(mockVehiculo);
      mockServicioRepository.create.mockReturnValue(mockServicioGuardado);
      mockServicioRepository.save.mockResolvedValue(mockServicioGuardado);
      // Mock del findOne final que devuelve el objeto completo
      mockServicioRepository.findOne.mockResolvedValue(mockServicioGuardado);

      // EJECUCIÓN
      const result = await service.create(dto as any);

      // ASERCIONES (VERIFICACIONES)
      
      // 1. Verificamos que buscó el incidente
      expect(incidenteService.findOne).toHaveBeenCalledWith(1);
      
      // 2. Verificamos que marcó el incidente en tratamiento
      expect(incidenteService.marcarEnTratamiento).toHaveBeenCalledWith(1);
      
      // 3. Verificamos que cambió el status del vehículo a EN_TALLER (Side Effect importante)
      expect(vehiculosService.updateStatus).toHaveBeenCalledWith(100, VehiculoStatus.EN_TALLER);
      
      // 4. Verificamos que se guardó el servicio
      expect(mockServicioRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockServicioGuardado);
    });

    it('debería lanzar error si no se envía ni incidente_id ni id_vehiculo', async () => {
      const dto = {
        tipo: 'Mecánica',
        fecha_inicio: '2023-10-10',
        descripcion: 'Fail',
      };

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });
  });
});