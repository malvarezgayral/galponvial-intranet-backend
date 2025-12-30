import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UnidadTipo } from '../enums/almacen.enum';

export class CreateArticuloDto {
  @ApiPropertyOptional({
    description: 'Código del proveedor',
    example: 'PROV-123',
  })
  @IsOptional()
  @IsString()
  cod_proveedor?: string;

  @ApiProperty({
    example: 'Filtro de aceite',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'FO-2024',
  })
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @ApiProperty({
    example: 'Filtro compatible con motor X',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({
    example: 'https://example.com/filtro.jpg',
  })
  @IsOptional()
  @IsString()
  img_url?: string;

  @ApiProperty({
    enum: UnidadTipo,
    example: UnidadTipo.PIEZA,
  })
  @IsEnum(UnidadTipo)
  unidad_tipo: UnidadTipo;
}
