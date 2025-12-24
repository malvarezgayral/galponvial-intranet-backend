/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloDto } from './create-articulo.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {
  @IsOptional()
  @IsNumber()
  cod?: number;

  @IsOptional()
  @IsNumber()
  grupo_id?: number;

  @IsOptional()
  @IsNumber()
  unidad_medida_id?: number;
}
