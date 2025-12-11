import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { TipoServicio } from '../enums/vehiculo.enum';

export class CreateServicioDto {
  @IsEnum(TipoServicio)
  tipo: TipoServicio;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_hasta: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  id_vehiculo: number;

  @IsNumber()
  @IsOptional()
  incidente_id?: number;
}