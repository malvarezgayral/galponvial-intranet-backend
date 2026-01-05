import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestConfig } from '../../src/database/typeorm.config';

jest.mock('../../src/usuario/authStrategies/jwt.strategy', () => ({
  JwtStrategy: jest.fn().mockImplementation(() => ({})),
}));


describe('Seed Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            ...typeOrmTestConfig,
            synchronize: true,
            dropSchema: true, 
          }),
          AppModule,
        ],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  }, 20000);

  beforeEach(async () => {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`);
    }
  });


  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  it('POST /seed/run debería poblar la base correctamente', async () => {
    const res = await request(app.getHttpServer())
      .post('/seed/run')
      .expect(200);

    expect(res.body.message).toBeDefined();
    expect(res.body.results.sector).toBeGreaterThan(0);
    expect(res.body.results.articulo).toBeGreaterThan(0);
    expect(res.body.results.usuario).toBeGreaterThan(0);
  });

  it('no debería haber artículos sin grupo válido', async () => {
    const result = await dataSource.query(`
      SELECT COUNT(*) FROM articulo a
      LEFT JOIN grupo_articulo g ON a.grupo_id = g.id
      WHERE g.id IS NULL
    `);

    expect(Number(result[0].count)).toBe(0);
  });

  it('ejecutar el seed dos veces debería fallar por unique property', async () => {
    const firstRun = await request(app.getHttpServer())
      .post('/seed/run');

    expect(firstRun.status).toBe(200);

    const secondRun = await request(app.getHttpServer())
      .post('/seed/run');

    expect(secondRun.status).not.toBe(200);
  });
})
