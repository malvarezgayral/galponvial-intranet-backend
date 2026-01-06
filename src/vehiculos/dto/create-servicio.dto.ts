import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional, IsInt } from 'class-validator';
import { TipoServicio } from '../enums/vehiculo.enum';

export class CreateServicioDto {
  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsNotEmpty()
  @IsEnum(TipoServicio)
  tipo: TipoServicio;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsInt()
  incidente_id: number; 
}