import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EntradaTipo } from '../enums/almacen.enum';

export class CreateEntradaDto {
  @ApiProperty({
    enum: EntradaTipo,
    example: EntradaTipo.COMPRA,
  })
  @IsEnum(EntradaTipo)
  tipo: EntradaTipo;

  @ApiProperty({
    example: 'Ingreso por compra directa',
  })
  @IsString()
  @IsNotEmpty()
  detalle: string;

  @ApiProperty({
    example: 'Proveedor S.A.',
  })
  @IsString()
  @IsNotEmpty()
  proveedor: string;

  @ApiProperty({
    description: 'Código del artículo',
    example: 1001,
  })
  @IsString()
  @IsNotEmpty()
  cod_articulo: number;
}
