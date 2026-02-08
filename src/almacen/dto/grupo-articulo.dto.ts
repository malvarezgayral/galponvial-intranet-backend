import { ApiProperty } from '@nestjs/swagger';
import { UpdateArticuloDto } from './update-articulo.dto';

export class GrupoArticuloDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Lubricantes' })
  nombre: string;

  @ApiProperty({ example: 'Aceites y lubricantes', required: false })
  descripcion?: string;

  @ApiProperty({ example: 2, required: false })
  sector_galpon?: number;

  @ApiProperty({ example: 'Almacen-Taller', required: false })
  nombre_sector?: string;

  @ApiProperty({ type: () => [UpdateArticuloDto] })
  articulos: Array<UpdateArticuloDto>;
}
