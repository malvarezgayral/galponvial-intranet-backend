/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UnidadTipo } from '../enums/almacen.enum';

export class CreateArticuloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsOptional()
  @IsString()
  img_url?: string;

  @IsEnum(UnidadTipo)
  unidad_tipo: UnidadTipo;

  @IsNotEmpty()
  grupo_id: number;

  @IsOptional()
  unidad_medida_id?: number;
}
