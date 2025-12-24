import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { AlmacenModule } from '../src/almacen/almacen.module';
import { typeOrmTestConfig } from '../src/database/typeorm.config';

describe('Almacen E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmTestConfig), AlmacenModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 20000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /almacen/articulos', async () => {
    const res = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        grupo_id: 1,
      })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.nombre).toBe('Articulo Test');
  });

  it('GET /almacen/articulos', async () => {
    const res = await request(app.getHttpServer())
      .get('/almacen/articulos')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /almacen/movimientos - should create salida', async () => {
    const resArticle = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        grupo_id: 1,
      })
      .expect(201);

    const resMovement = await request(app.getHttpServer())
      .post('/almacen/movimientos')
      .send({
        tipo: 'perdida',
        detalle: 'se rompio algo',
        motivo_salida: 'pos eso mismo',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        cod_articulo: resArticle.body.cod,
      })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(resMovement.body.movimiento.tipo).toBe('salida');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(resMovement.body.salida.tipo).toBe('perdida');
  });
});
