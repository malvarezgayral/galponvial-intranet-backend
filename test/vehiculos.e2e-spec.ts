import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestConfig } from 'src/database/typeorm.config';
import { JwtAuthGuard } from 'src/usuario/guards/jwt-auth.guard'; 
import { UserValidRoleGuard } from 'src/usuario/guards/user-valid-role.guard'; 
import { Usuario } from 'src/usuario/entities/usuario.entity'; 
import { Rol } from 'src/usuario/entities/rol.entity'; 
import { Vehiculo } from 'src/vehiculos/entities/vehiculo.entity'; 
import { ValidRoles, Permisos } from 'src/usuario/enums/usuario.enum'; 
import { VehiculoStatus } from 'src/vehiculos/enums/vehiculo.enum';
import { StatusUpdate } from 'src/vehiculos/entities/status-update.entity';

describe('Vehiculos Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sectorId: number;
  const usuarioDniTest = '12345678'; 

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmTestConfig,
          synchronize: true, 
          dropSchema: true,
        }),
        AppModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { 
            dni: Number(usuarioDniTest), 
            rol: { rol: ValidRoles.admin } 
          };
          return true;
        },
      })
      .overrideGuard(UserValidRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      await dataSource.query('SET session_replication_role = "replica";');
      for (const entity of entities) {
        await dataSource
          .getRepository(entity.name)
          .query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`);
      }
      await dataSource.query('SET session_replication_role = "origin";');
        
      const sectorRes = await dataSource.query(
        `INSERT INTO sector (nombre) VALUES ('Sector Test') RETURNING id_sector`
      );
      sectorId = sectorRes[0].id_sector;

      const rolRepo = dataSource.getRepository(Rol);
      const nuevoRol = new Rol();
      nuevoRol.rol = ValidRoles.admin;
      nuevoRol.permisos = [
        Permisos.lectura,
        Permisos.escritura,
        Permisos.lectoEscritura,
      ];
      const rolAdmin = await rolRepo.save(nuevoRol);

      const usuarioRepo = dataSource.getRepository(Usuario);
      const usuario = new Usuario();
      usuario.dni = Number(usuarioDniTest);
      usuario.nombre = 'Test';
      usuario.apellido = 'User';
      usuario.email = 'test@test.com';
      usuario.password = '1234'; 
      usuario.isActive = true;
      usuario.rol = rolAdmin; 
      await usuarioRepo.save(usuario);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Flujo Completo: Vehiculo -> Incidente -> Servicio', () => {
    it('Debería crear vehículo, reportar incidente, crear servicio y cambiar status automáticamente', async () => {
      const createVehiculoDto = {
        codigo: 'V-TEST-01',
        nombre: 'Hilux Test Unit',
        tipo_vehiculo: 'camioneta',
        marca: 'Toyota',
        modelo: 'Hilux',
        patente: 'AA123BB',
        anio: 2023,
        km_actual: 10000,
        status: 'disponible',
        infoAdicional: {
            id_sector_pertenencia: Number(sectorId),
            numero_serie: 111111,
            licencia_conductor: 'B1',
            color: 'Rojo',
            seguro_empresa: 'TestSeguros',
            poliza: 'POL-123'
            }
      };

      const vehiculoRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send(createVehiculoDto)
        .expect(201);

      const vehiculoId = vehiculoRes.body.id_vehiculo || vehiculoRes.body.id;
      if (!vehiculoId) throw new Error('El ID del vehículo no vino en la respuesta');

      const createIncidenteDto = {
        tipo: 'Mecánica',
        descripcion: 'Ruido en motor',
        falla: 'critica',
        fecha: new Date().toISOString(),
        id_usuario: Number(usuarioDniTest),
      };

      const incidenteRes = await request(app.getHttpServer())
        .post(`/vehiculos/${vehiculoId}/incidentes`)
        .send(createIncidenteDto)
        .expect(201);

      const incidenteId = incidenteRes.body.id || incidenteRes.body.id_incidente;

      const createServicioDto = {
        tipo: 'reparacion',
        fecha_inicio: new Date().toISOString(),
        descripcion: 'Cambio de piezas',
        incidente_id: incidenteId,
      };

      await request(app.getHttpServer())
        .post('/servicios')
        .send(createServicioDto)
        .expect(201);

      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoFinal = await vehiculoRepo.findOne({
        where: { id_vehiculo: vehiculoId },
      });

      expect(vehiculoFinal).toBeDefined();
      expect(vehiculoFinal!.status).toBe(VehiculoStatus.EN_TALLER);
    });
  });

  describe('Incidentes de Vehículo', () => {
    it('No debería cambiar el status del vehículo con incidente NO crítico', async () => {
      const vRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send({
          codigo: 'V-NO-CRIT',
          nombre: 'Vehiculo No Critico',
          tipo_vehiculo: 'camioneta',
          marca: 'Ford',
          modelo: 'Ranger',
          patente: 'NC123AA',
          anio: 2022,
          km_actual: 1000,
          status: 'disponible',
          infoAdicional: {
            id_sector_pertenencia: Number(sectorId),
            numero_serie: 111111,
            licencia_conductor: 'B1',
            color: 'Rojo',
            seguro_empresa: 'TestSeguros',
            poliza: 'POL-123'
            }
        })
        .expect(201);

      const vehiculoId = vRes.body.id_vehiculo || vRes.body.id;

      await request(app.getHttpServer())
        .post(`/vehiculos/${vehiculoId}/incidentes`)
        .send({
          tipo: 'Chequeo',
          descripcion: 'Revisión menor',
          falla: 'baja',
          fecha: new Date().toISOString(),
          id_usuario: Number(usuarioDniTest),
        })
        .expect(201);

      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculo = await vehiculoRepo.findOne({
        where: { id_vehiculo: vehiculoId },
      });

      expect(vehiculo).toBeDefined();
      expect(vehiculo!.status).toBe(VehiculoStatus.DISPONIBLE);
    });

    it('No debería permitir crear un incidente para un vehículo inexistente', async () => {
      await request(app.getHttpServer())
        .post('/vehiculos/99999/incidentes')
        .send({
          tipo: 'Test',
          descripcion: 'Incidente inválido',
          falla: 'critica',
          fecha: new Date().toISOString(),
          id_usuario: Number(usuarioDniTest),
        })
        .expect(404);
    });
  });

  describe('Endpoints de Paginación', () => {
    it('GET /vehiculos/:id/incidentes debe devolver estructura paginada', async () => {
      // ⬅️ TEST TAL CUAL
      const vRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send({
          codigo: 'V-PAG-01',
          nombre: 'Ford Ranger Test',
          tipo_vehiculo: 'camioneta',
          marca: 'Ford',
          modelo: 'Ranger',
          patente: 'TEST999',
          anio: 2022,
          km_actual: 500,
          status: 'disponible',
          infoAdicional: {
            id_sector_pertenencia: Number(sectorId),
            numero_serie: 111111,
            licencia_conductor: 'B1',
            color: 'Rojo',
            seguro_empresa: 'TestSeguros',
            poliza: 'POL-123'
            }
        })
        .expect(201);

      const vid = vRes.body.id_vehiculo || vRes.body.id;

      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      await vehiculoRepo.query(
        `UPDATE vehiculo SET eliminado = false WHERE id_vehiculo = ${vid}`,
      );

      await request(app.getHttpServer())
        .post(`/vehiculos/${vid}/incidentes`)
        .send({
          tipo: 'Test',
          descripcion: 'Test desc',
          falla: 'baja',
          fecha: new Date(),
          id_usuario: Number(usuarioDniTest),
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/vehiculos/${vid}/incidentes?page=1&pageSize=5`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data && res.body.data.data) {
        expect(Array.isArray(res.body.data.data)).toBe(true);
      }
    });
  });

  describe('Cargas de Combustible', () => {
    it('Debería registrar una carga de combustible y devolverla paginada', async () => {
      const vRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send({
          codigo: 'V-FUEL-01',
          nombre: 'Vehiculo Fuel',
          tipo_vehiculo: 'camioneta',
          marca: 'Toyota',
          modelo: 'Hilux',
          patente: 'FUEL123',
          anio: 2021,
          km_actual: 20000,
          status: 'disponible',
          infoAdicional: {
            id_sector_pertenencia: Number(sectorId),
            numero_serie: 111111,
            licencia_conductor: 'B1',
            color: 'Rojo',
            seguro_empresa: 'TestSeguros',
            poliza: 'POL-123'
            }

        })
        .expect(201);

      const vehiculoId = vRes.body.id_vehiculo || vRes.body.id;

      await request(app.getHttpServer())
        .post(`/vehiculos/${vehiculoId}/combustible-cargas`)
        .send({
          fecha_carga: new Date().toISOString(),
          despachante: "marito",
          km_actual: 120000,
          cant_combustible_despachado: 1200
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(
          `/vehiculos/${vehiculoId}/combustible-cargas?page=1&pageSize=5`,
        )
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Status e Histórico', () => {
    it('Debería cambiar el status del vehículo y generar histórico', async () => {
      const vRes = await request(app.getHttpServer())
        .post('/vehiculos')
        .send({
          codigo: 'V-STATUS-01',
          nombre: 'Vehiculo Status',
          tipo_vehiculo: 'camion',
          marca: 'Iveco',
          modelo: 'Daily',
          patente: 'STAT123',
          anio: 2020,
          km_actual: 80000,
          status: 'disponible',
         infoAdicional: {
            id_sector_pertenencia: Number(sectorId),
            numero_serie: 111111,
            licencia_conductor: 'B1',
            color: 'Rojo',
            seguro_empresa: 'TestSeguros',
            poliza: 'POL-123'
            }
        })
        .expect(201);

      const vehiculoId = vRes.body.id_vehiculo || vRes.body.id;

      await request(app.getHttpServer())
        .put(`/vehiculos/${vehiculoId}/status`)
        .send({ nuevoStatus: VehiculoStatus.EN_USO })
        .expect(200);

      const statusUpdateRepo = dataSource.getRepository(StatusUpdate);
      const updates = await statusUpdateRepo.find({
        where: { vehiculo: { id_vehiculo: vehiculoId } },
        order: { fecha_desde: 'DESC' },
        });

        expect(updates.length).toBeGreaterThan(0);
        expect(updates[0].tipo).toBe(VehiculoStatus.DISPONIBLE);
    });
  });
});
