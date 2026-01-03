import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CsvReaderService } from './csv-reader.service';

// Entidades - Vehiculos
import { Sector } from '../vehiculos/entities/sector.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { InfoAdicional } from '../vehiculos/entities/info-adicional.entity';
import { CombustibleCarga } from '../vehiculos/entities/combustible-carga.entity';
import { StatusUpdate } from '../vehiculos/entities/status-update.entity';
import { Recordatorio } from '../vehiculos/entities/recordatorio.entity';

// Entidades - Almacen
import { SectorGalpon } from '../almacen/entities/sector-galpon.entity';
import { UnidadMedidaCuant } from '../almacen/entities/unidad-medida-cuant.entity';
import { GrupoArticulo } from '../almacen/entities/grupo-articulo.entity';
import { Articulo } from '../almacen/entities/articulo.entity';
import { Movimiento } from '../almacen/entities/movimiento.entity';
import { Entrada } from '../almacen/entities/entrada.entity';
import { Salida } from '../almacen/entities/salida.entity';

// Entidades - Usuario
import { Rol } from '../usuario/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioVehiculo } from '../usuario/entities/usuario-vehiculo.entity';
import { ReporteIncidente } from '../usuario/entities/reporte-incidente.entity';
import { Servicio } from '../usuario/entities/servicio.entity';
import { RefreshToken } from '../usuario/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Vehiculos
      Sector,
      Vehiculo,
      InfoAdicional,
      CombustibleCarga,
      StatusUpdate,
      Recordatorio,
      // Almacen
      SectorGalpon,
      UnidadMedidaCuant,
      GrupoArticulo,
      Articulo,
      Movimiento,
      Entrada,
      Salida,
      // Usuario
      Rol,
      Usuario,
      UsuarioVehiculo,
      ReporteIncidente,
      Servicio,
      RefreshToken,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService, CsvReaderService],
})
export class SeedModule {}
