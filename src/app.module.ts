import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { AlmacenModule } from './almacen/almacen.module';
import { SeedModule } from './seed/seed.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ServiceModule } from './service/service.module';
import { ReparacionModule } from './reparacion/reparacion.module';
import { ProveedorModule } from './proveedores/proveedor.module';
import { ComprasModule } from './compras/compras.module';
import { LubricentroModule } from './lubricentro/lubricentro.module';
import { PersonalModule } from './personal/personal.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
const isTestEnv = process.env.NODE_ENV === 'test';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(!isTestEnv
      ? [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
              ? parseInt(process.env.DB_PORT, 10)
              : 5432,
            database: process.env.DB_NAME,
                        username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
          }),
        ]
      : []),
    VehiculosModule,
    AlmacenModule,
    SeedModule,
    UsuarioModule,
    ServiceModule,
    ReparacionModule,
    ProveedorModule,
    ComprasModule,
    LubricentroModule,
    PersonalModule,
    NotificacionesModule,
  ],
})
export class AppModule {}