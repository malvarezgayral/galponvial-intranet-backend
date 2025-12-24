import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehiculosModule } from './vehiculos/vehiculos.module';
import { AlmacenModule } from './almacen/almacen.module';
import { SeedModule } from './seed/seed.module';
import { UsuarioModule } from './usuario/usuario.module';

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
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
            logging: ['query'],
          }),
        ]
      : []),

    VehiculosModule,
    AlmacenModule,
    SeedModule,
    UsuarioModule,
  ],
})
export class AppModule {}
