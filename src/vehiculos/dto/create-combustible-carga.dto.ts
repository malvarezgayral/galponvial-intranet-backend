import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCombustibleCargaDto {
  @ApiProperty({
    description: 'Fecha de la carga de combustible',
    example: '2024-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_carga: string;

  @ApiPropertyOptional({
    description: 'Nombre del despachante',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  despachante?: string;

  @ApiProperty({
    description: 'Kilometraje actual del vehículo',
    example: 125000,
  })
  @IsNumber()
  @Min(0)
  km_actual: number;

  @ApiProperty({
    description: 'Cantidad de combustible despachado (en litros)',
    example: 45.5,
  })
  @IsNumber()
  @Min(0)
  cant_combustible_despachado: number;
}
