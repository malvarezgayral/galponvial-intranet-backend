/* eslint-disable prettier/prettier */
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SalidaTipo } from '../entities/salida.entity';

export class CreateSalidaDto {
  @IsEnum(SalidaTipo)
  tipo: SalidaTipo;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsString()
  @IsNotEmpty()
  motivo_salida: string;

  @IsOptional()
  @IsString()
  detalle_motivo?: string;

  @IsInt()
  @IsNotEmpty()
  cod_articulo: number;
}
