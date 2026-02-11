import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateArticuloDto } from './create-articulo.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {
  @ApiPropertyOptional({
    example: '1001',
  })
  @IsString()
  @IsOptional()
  cod_proveedor?: string;

  @ApiPropertyOptional({
    description: 'ID del grupo de artículo',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grupo_id?: number;

  @ApiPropertyOptional({
    description: 'ID de la unidad de medida',
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unidad_medida_id?: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen actualizada',
  })
  @IsOptional()
  @IsString()
  img_url?: string;
}
