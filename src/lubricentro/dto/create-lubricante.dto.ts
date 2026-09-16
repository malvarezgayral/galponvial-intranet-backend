// src/lubricentro/dto/create-lubricante.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLubricanteDto {
  @IsInt()
  @IsNotEmpty()
  id_vehiculo!: number;

  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsOptional()
  ordenRetiro?: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
