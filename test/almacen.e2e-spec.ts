import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';

import { typeOrmAlmacenTestConfig } from '../src/database/test/typeorm-almacen.config';
import { AlmacenModule } from '../src/almacen/almacen.module';
import { UserValidRoleGuard } from 'src/usuario/guards/user-valid-role.guard';
import { JwtAuthGuard } from 'src/usuario/guards/jwt-auth.guard';


describe('Almacen E2E', () => {
  let app: INestApplication;

beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeOrmAlmacenTestConfig),
        AlmacenModule,
      ],
      providers: [
        {
            provide: APP_GUARD,
            useValue: { canActivate: () => true }
        }
      ],
    })
      .overrideGuard(JwtAuthGuard) 
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { 
            id: 1, 
            dni: '12345678', 
            rol: { rol: 'ADMIN' }
          };
          return true;
        },
      })
      .overrideGuard(UserValidRoleGuard) 
      .useValue({ canActivate: () => true })
      
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
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
        cod_proveedor: 'COD-1',
      })
      .expect(201);

    expect(res.body.nombre).toBe('Articulo Test');
  });

  it('PUT /almacen/articulos', async () => {
    const resArticle = await request(app.getHttpServer())
      .post('/almacen/articulos')
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        cod_proveedor: 'COD-1',
      })
      .expect(201);

    const resPut = await request(app.getHttpServer())
      .put(`/almacen/articulos/${resArticle.body.cod}`)
      .send({
        nombre: 'Articulo Test Actualizado',
        descripcion: 'Descp',
        modelo: 'Nuevo modelo',
        stock: 9,
        unidad_tipo: 'pieza',
        cod_proveedor: 'COD-2',
      })
      .expect(200);

    expect(resPut.body.nombre).toBe('Articulo Test Actualizado');
  });

  it('GET /almacen/articulos', async () => {
    const res = await request(app.getHttpServer())
      .get('/almacen/articulos')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /almacen/grupos', async () => {
    const res = await request(app.getHttpServer())
      .post('/almacen/grupos')
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
      .send({
        nombre: 'Articulo Test',
        modelo: 'Modelo',
        descripcion: 'Descp',
        img_url: 'https://example.com/filtro.jpg',
        unidad_tipo: 'pieza',
        grupo_id: 1,
        cod_proveedor: 'COD-2',
      })
      .expect(201);

    const resMovement = await request(app.getHttpServer())
      .post('/almacen/movimientos')
      .send({
        tipo: 'perdida',
        detalle: 'se rompio algo',
        motivo_salida: 'pos eso mismo',
        cod_articulo: Number(resArticle.body.cod),
      })
      .expect(201);

    expect(resMovement.body.movimiento.tipo).toBe('salida');
    expect(resMovement.body.salida.tipo).toBe('perdida');
  });
});
