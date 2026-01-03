/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloDto } from './create-articulo.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {
  @IsString()
  @IsOptional()
  cod_proveedor?: string;

  @IsOptional()
  @IsNumber()
  grupo_id?: number;

  @IsOptional()
  @IsNumber()
  unidad_medida_id?: number;
}
