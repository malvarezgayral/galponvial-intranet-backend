import { ApiProperty } from '@nestjs/swagger';
import { SectorTipo } from '../enums/almacen.enum';

export class SectorGalponDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 3,
    description: 'Número identificador del sector dentro del galpón',
  })
  nro_sector: number;

  @ApiProperty({
    enum: SectorTipo,
    example: SectorTipo.ALMACEN_COMUN,
  })
  tipo: SectorTipo;

  @ApiProperty({
    example: 'Sector destinado a repuestos del taller',
  })
  descripcion: string;
}
