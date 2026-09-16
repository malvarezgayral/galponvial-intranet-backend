// src/compras/dto/create-presupuesto.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePresupuestoDto {
  @IsInt()
  @IsOptional()
  id_proveedor?: number;

  @IsString()
  @IsNotEmpty()
  producto!: string;

  @IsNumber()
  @IsNotEmpty()
  precio!: number;

  @IsString()
  @IsNotEmpty()
  unidad!: string;

  @IsString()
  @IsNotEmpty()
  areaMunicipio!: string;

  @IsString()
  @IsNotEmpty()
  fechaSolicitud!: string;

  @IsString()
  @IsNotEmpty()
  fechaEntrega!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
