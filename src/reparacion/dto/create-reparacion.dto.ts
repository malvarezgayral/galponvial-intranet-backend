// src/reparacion/dto/create-reparacion.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TallerTipo } from '../enums/reparacion.enum';

export class CreateReparacionDto {
  @IsInt()
  @IsNotEmpty()
  id_vehiculo!: number;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsEnum(TallerTipo)
  @IsNotEmpty()
  taller!: TallerTipo;

  @IsString()
  @IsNotEmpty()
  fecha_entrada!: string;

  @IsString()
  @IsOptional()
  fecha_salida?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
