// src/lubricante-entrada/dto/create-lubricante-entrada.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class LubricanteEntradaItemDto {
  @IsDateString()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
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
