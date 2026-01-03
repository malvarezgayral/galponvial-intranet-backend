/* eslint-disable prettier/prettier */
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { UnidadTipo } from '../enums/almacen.enum';

export class CreateArticuloDto {
  @IsOptional()
  @IsString()
  cod_proveedor?: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  img_url: string;

  @IsEnum(UnidadTipo)
  unidad_tipo: UnidadTipo;

  @IsOptional()
  @IsNumber()
  stock?: number;
}
