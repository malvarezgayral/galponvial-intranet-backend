import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { TipoIncidente, CriticidadIncidente } from '../enums/vehiculo.enum';

export class CreateIncidenteDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsEnum(TipoIncidente)
  tipo: TipoIncidente;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(CriticidadIncidente)
  falla: CriticidadIncidente;

  @IsNumber()
  @IsNotEmpty()
  id_vehiculo: number;

  @IsBoolean()
  @IsOptional()
  cambiar_status_vehiculo?: boolean;
}