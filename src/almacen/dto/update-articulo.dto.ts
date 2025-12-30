import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloDto } from './create-articulo.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {
  @ApiPropertyOptional({
    example: 1001,
  })
  @IsNumber()
  @IsOptional()
  cod?: number;

  @ApiPropertyOptional({
    description: 'ID del grupo de artículo',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  grupo_id?: number;

  @ApiPropertyOptional({
    description: 'ID de la unidad de medida',
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  unidad_medida_id?: number;
}
