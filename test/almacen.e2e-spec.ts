import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { typeOrmAlmacenTestConfig } from '../src/database/test/typeorm-almacen.config';
import request from 'supertest';

import { AlmacenModule } from '../src/almacen/almacen.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { generateTestToken } from './utils/jwt-test.util';

describe('Almacen E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeOrmAlmacenTestConfig),
        JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 },
        }),
        AlmacenModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get(JwtService);
    token = generateTestToken(jwtService);
  }, 20000);

  it('POST /almacen/articulos', async () => {
    const res = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        cod_proveedor: "COD-1", 
      })
      .expect(201);

    expect(res.body.nombre).toBe('Articulo Test');
  });

  it('PUT /almacen/articulos', async () => {
    const resArticle = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        cod_proveedor: "COD-1",
      })
      .expect(201);

    const resPut = await request(app.getHttpServer())
      .put(`/almacen/articulos/${resArticle.body.cod}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Articulo Test Actualizado',
        descripcion: 'Descp',
        modelo: 'Nuevo modelo',
        stock: 9,
        unidad_tipo: 'pieza',
        cod_proveedor: "COD-2",
      })
      .expect(200);

    expect(resPut.body.nombre).toBe('Articulo Test Actualizado');
  });

  it('GET /almacen/articulos', async () => {
    const res = await request(app.getHttpServer())
      .get('/almacen/articulos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /almacen/grupos', async () => {
    const res = await request(app.getHttpServer())
      .post('/almacen/grupos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Grupo Test',
        descripcion: 'Descp grupo',
        sector_id: 1,
      })
      .expect(201);

    expect(res.body.nombre).toBe('Grupo Test');
  });

  it('POST /almacen/movimientos - should create salida', async () => {
    const resArticle = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        grupo_id: 1,
        cod_proveedor: "COD-2", 
      })
      .expect(201);

    const resMovement = await request(app.getHttpServer())
      .post('/almacen/movimientos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'perdida',
        detalle: 'se rompio algo',
        motivo_salida: 'pos eso mismo',
        cod_articulo: Number(resArticle.body.cod), // aseguramos que sea number
      })
      .expect(201);

    expect(resMovement.body.movimiento.tipo).toBe('salida');
    expect(resMovement.body.salida.tipo).toBe('perdida');
  });
});
