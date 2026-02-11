import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { UnidadTipo } from '../enums/almacen.enum';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
    description:
      'URL de la imagen (se genera automáticamente al subir archivo)',
    example: 'https://res.cloudinary.com/...',
  })
  @IsString()
  @IsOptional()
  img_url?: string;

  @ApiProperty({
    enum: UnidadTipo,
    example: UnidadTipo.PIEZA,
  })
  @IsEnum(UnidadTipo)
  unidad_tipo: UnidadTipo;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @ApiProperty({
    description: 'ID del grupo al que pertenece el artículo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  grupo_id: number;

  @ApiPropertyOptional({
    description: 'ID de la unidad de medida',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unidad_medida_id?: number;
}
