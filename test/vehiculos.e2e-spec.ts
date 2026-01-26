import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestConfig } from 'src/database/typeorm.config';
import { JwtAuthGuard } from 'src/usuario/guards/jwt-auth.guard';
import { UserValidRoleGuard } from 'src/usuario/guards/user-valid-role.guard';

describe('Vehiculos Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sectorId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // 1. Forzamos la conexión de Test explícitamente (Igual que en tu Seed)
        TypeOrmModule.forRoot({
            ...typeOrmTestConfig,
            synchronize: true,
            dropSchema: true,
        }),
        // 2. Importamos el AppModule para tener todo lo demás
        AppModule,
      ],
      // providers: [...] (Si necesitas algo extra, pero con los overrides abajo alcanza)
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1, dni: '12345678', rol: { rol: 'ADMIN' } };
          return true;
        },
      })
      .overrideGuard(UserValidRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  // Limpieza y Setup de datos básicos antes de cada test
  beforeEach(async () => {
    if (dataSource && dataSource.isInitialized) {
        const entities = dataSource.entityMetadatas;
        // Deshabilitar constraints para limpiar rápido
        await dataSource.query('SET session_replication_role = "replica";');
        for (const entity of entities) {
            await dataSource.getRepository(entity.name).query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`);
        }
        await dataSource.query('SET session_replication_role = "origin";');
        
        // --- SEEDER DUMMY PARA TEST ---
        // Necesitamos un Sector para crear vehículos
        const sectorRes = await dataSource.query(`
            INSERT INTO sector (nombre, descripcion) 
            VALUES ('Sector Test', 'Sector para e2e') 
            RETURNING id
        `);
        sectorId = sectorRes[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Flujo Completo: Vehiculo -> Incidente -> Servicio', () => {
    
    it('Debería crear vehículo, reportar incidente, crear servicio y cambiar status automáticamente', async () => {
      // 1. CREAR VEHÍCULO
      const createVehiculoDto = {
        marca: 'Toyota',
        modelo: 'Hilux',
        patente: 'AA123BB',
        anio: 2023,
        km_actual: 10000,
        id_sector_pertenencia: sectorId, // Usamos el ID del sector creado
        status: 'disponible'
      };

      const vehiculoRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send(createVehiculoDto)
        .expect(201);

      const vehiculoId = vehiculoRes.body.id_vehiculo;
      expect(vehiculoId).toBeDefined();
      expect(vehiculoRes.body.status).toBe('disponible');

      // 2. REPORTAR INCIDENTE (Asociado al vehículo creado)
      const createIncidenteDto = {
        tipo: 'Mecánica',
        descripcion: 'Ruido en motor',
        falla: 'grave', // o 'alta' según tu enum
        fecha: new Date().toISOString(),
        id_usuario: 1 // Asumiendo que hay un usuario o el sistema lo permite
        // Nota: Si ReporteIncidente tiene FK a Usuario, deberías insertar un usuario dummy en el beforeEach también.
      };

      // Si tu controller usa :id como DNI o ID Vehiculo, ajústalo. 
      // Según tu código: @Post(':id/incidentes') donde id es 'dni' en el param name pero parece ser vehiculoId en la lógica
      const incidenteRes = await request(app.getHttpServer())
        .post(`/vehiculos/${vehiculoId}/incidentes`) 
        .send(createIncidenteDto)
        .expect(201);
      
      const incidenteId = incidenteRes.body.id;

      // 3. CREAR SERVICIO (Asociado al incidente)
      const createServicioDto = {
        tipo: 'Reparación',
        fecha_inicio: new Date().toISOString(),
        descripcion: 'Cambio de piezas',
        incidente_id: incidenteId
      };

      await request(app.getHttpServer())
        .post('/servicios')
        .send(createServicioDto)
        .expect(201);

      // 4. VERIFICAR SIDE EFFECT: El vehículo debe estar ahora EN_TALLER
      // Hacemos un GET al vehículo para ver su estado actual
      const checkVehiculo = await request(app.getHttpServer())
        .get(`/vehiculos`)
        .expect(200);
      
      // Buscamos nuestro vehiculo en la lista (o usamos un getOne si existiera en el controller publico)
      const miVehiculo = checkVehiculo.body.data.find(v => v.id_vehiculo === vehiculoId);
      
      expect(miVehiculo.status).toBe('en_taller');
    });
  });

  describe('Endpoints de Paginación', () => {
    it('GET /vehiculos/:id/incidentes debe devolver estructura paginada', async () => {
        // Setup: Crear vehiculo
        // (Podrías extraer la creación a una función helper para no repetir código)
        const vRes = await request(app.getHttpServer())
            .post('/vehiculos')
            .send({
                marca: 'Ford', modelo: 'Ranger', patente: 'TEST999', anio: 2022, km_actual: 500,
                id_sector_pertenencia: sectorId, status: 'disponible'
            });
        const vid = vRes.body.id_vehiculo;

        // Crear incidente
        await request(app.getHttpServer())
            .post(`/vehiculos/${vid}/incidentes`)
            .send({ tipo: 'Test', descripcion: 'Test desc', falla: 'media', fecha: new Date(), id_usuario: 1 });

        // Testear endpoint paginado
        const res = await request(app.getHttpServer())
            .get(`/vehiculos/${vid}/incidentes?page=1&pageSize=5`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.data)).toBe(true); // data.data porque tu servicio devuelve { data, total... }
        expect(res.body.data.total).toBeGreaterThanOrEqual(1);
        expect(res.body.data.page).toBe(1);
    });
  });
});