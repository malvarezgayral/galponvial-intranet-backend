// src/lubricentro/dto/create-lubricante.dto.ts
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TIPOS_LUBRICANTE } from '../../lubricante-entrada/tipos-lubricante';

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
  direccion?: string;

  @IsIn([...TIPOS_LUBRICANTE, ''], {
    message: 'El lubricante no está en la lista',
  })
  @IsString()
  @IsOptional()
  lubricante?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
