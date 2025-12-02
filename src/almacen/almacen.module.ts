import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';
import { Articulo } from './entities/articulo.entity';
import { Entrada } from './entities/entrada.entity';
import { GrupoArticulo } from './entities/grupo-articulo.entity';
import { Movimiento } from './entities/movimiento.entity';
import { Salida } from './entities/salida.entity';
import { SectorGalpon } from './entities/sector-galpon.entity';
import { UnidadMedidaCuant } from './entities/unidad-medida-cuant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Articulo,
      Entrada,
      GrupoArticulo,
      Movimiento,
      Salida,
      SectorGalpon,
      UnidadMedidaCuant,
    ]),
  ],
  controllers: [AlmacenController],
  providers: [AlmacenService],
})
export class AlmacenModule {}
