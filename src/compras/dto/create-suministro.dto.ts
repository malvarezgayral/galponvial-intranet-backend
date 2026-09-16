// src/compras/dto/create-suministro.dto.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SuministroItemDto {
  @IsString()
  @IsOptional()
  cantidad?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  costoUnitario?: number;

  @IsNumber()
  @IsOptional()
  costoEstimado?: number;
}

export class CreateSuministroDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsOptional()
  numeroSuministro?: string;

  @IsInt()
  @IsOptional()
  id_proveedor?: number;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsString()
  @IsOptional()
  agente?: string;

  @IsString()
  @IsOptional()
  jurisdiccion?: string;

  @IsString()
  @IsOptional()
  unidadEjecutora?: string;

  @IsString()
  @IsOptional()
  dependenciaSolicitante?: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsInt()
  @IsOptional()
  id_presupuesto?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SuministroItemDto)
  items?: SuministroItemDto[];
}
