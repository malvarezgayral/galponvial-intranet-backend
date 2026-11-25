// src/lubricante-entrada/dto/create-lubricante-entrada.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TIPOS_LUBRICANTE } from '../tipos-lubricante';

export class LubricanteEntradaItemDto {
  @IsDateString()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsIn([...TIPOS_LUBRICANTE], {
    message: 'El tipo de lubricante no está en la lista',
  })
  tipo!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'nroRemito debe contener solo números' })
  @MaxLength(50)
  nroRemito?: string;

  @IsNumber()
  @IsPositive()
  cantidad!: number;
}

export class CreateLubricanteEntradaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LubricanteEntradaItemDto)
  registros!: LubricanteEntradaItemDto[];
}
