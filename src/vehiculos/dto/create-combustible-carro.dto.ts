import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCombustibleCarroDto {
  @ApiProperty({ example: '2026-10-19' })
  @IsDateString()
  @IsNotEmpty()
  fecha_carga!: string;

  @ApiProperty({ example: 'Carlos García' })
  @IsString()
  @IsNotEmpty()
  chofer!: string;

  @ApiProperty({ example: 'Depósito' })
  @IsString()
  @IsNotEmpty()
  estacion_servicio!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  despachante!: string;

  @ApiProperty({ example: 'Diesel' })
  @IsString()
  @IsNotEmpty()
  tipo_combustible!: string;

  @ApiPropertyOptional({ example: 'Depósito (Galpón Vial)' })
  @IsOptional()
  @IsString()
  galpon_vial?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  litros_entrada!: number;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  litros_salida!: number;

  @ApiProperty({ example: 'Normal' })
  @IsString()
  @IsNotEmpty()
  estado_parcial!: string;
}
