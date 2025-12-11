/* eslint-disable prettier/prettier */
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
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

  @IsString()
  @IsNotEmpty()
  cod_articulo: string;
}
