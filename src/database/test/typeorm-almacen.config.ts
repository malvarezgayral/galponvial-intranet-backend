import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// entidades de almacen
import { Articulo } from '../../almacen/entities/articulo.entity';
import { Movimiento } from '../../almacen/entities/movimiento.entity';
import { Salida } from '../../almacen/entities/salida.entity';
import { Entrada } from '../../almacen/entities/entrada.entity';
import { GrupoArticulo } from 'src/almacen/entities/grupo-articulo.entity';
import { SectorGalpon } from 'src/almacen/entities/sector-galpon.entity';
import { UnidadMedidaCuant } from 'src/almacen/entities/unidad-medida-cuant.entity';

export const typeOrmAlmacenTestConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    Articulo,
    GrupoArticulo,
    Movimiento,
    Salida,
    Entrada,
    SectorGalpon,
    UnidadMedidaCuant,
  ],

  synchronize: true,
  dropSchema: true,

  logging: false,
};
