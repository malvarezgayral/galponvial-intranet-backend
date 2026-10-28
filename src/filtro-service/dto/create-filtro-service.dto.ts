// src/filtro-service/dto/create-filtro-service.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FiltroServiceItemDto {
  @IsOptional()
  @IsInt()
  idVehiculo?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  tipoFiltro!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  codigo?: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CreateFiltroServiceDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FiltroServiceItemDto)
  registros!: FiltroServiceItemDto[];
}
