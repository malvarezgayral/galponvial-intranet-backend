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
  @ApiProperty({ example: 'Motoniveladora 01' })
  @IsString()
  @IsNotEmpty()
  maquina!: string;

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

  @ApiPropertyOptional({
    example: 250,
    description: 'Litros de entrada. Completar este o litros_salida, nunca los dos.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  litros_entrada?: number;

  @ApiPropertyOptional({
    example: 230,
    description: 'Litros de salida. Completar este o litros_entrada, nunca los dos.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  litros_salida?: number;

  @ApiPropertyOptional({
    example: 28,
    description: 'Solo en la primera carga: total de combustible inicial.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_inicial?: number;

  @ApiPropertyOptional({
    example: 402790,
    description: 'Solo en la primera carga: estado parcial inicial.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estado_parcial_inicial?: number;
}
