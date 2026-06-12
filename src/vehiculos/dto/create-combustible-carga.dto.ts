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
  fecha_carga!: string;

  @ApiPropertyOptional({
    description: 'Nombre del despachante',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  despachante?: string;

  @ApiProperty({
    description: 'Tipo de combustible (Ej: Diesel, Nafta, GNC)',
    example: 'Diesel',
  })
  @IsString()
  @IsNotEmpty()
  tipo_combustible!: string;


  @ApiProperty({
    description: 'Ubicación en el Galpón Vial',
    example: 'Depósito',
  })
  @IsString()
  @IsNotEmpty()
  Galpón_Vial!: string;

  @ApiProperty({
    description: 'Kilometraje actual del vehículo',
    example: 125000,
  })
  @IsNumber()
  @Min(0)
  km_actual!: number;

  @ApiProperty({
    description: 'Cantidad de combustible despachado (en litros)',
    example: 45.5,
  })
  @IsNumber()
  @Min(0)
  cant_combustible_despachado!: number;

  @ApiProperty({
    description: 'Nombre del chofer',
    example: 'Carlos García',
  })
  @IsString()
  @IsNotEmpty()
  chofer!: string;

  @ApiProperty({
    description: 'Nombre de la estación de servicio',
    example: 'YPF Lobería',
  })
  @IsString()
  @IsNotEmpty()
  estacion_servicio!: string;

  @ApiProperty({
    description: 'Litros de entrada al tanque',
    example: 50.0,
  })
  @IsNumber()
  @Min(0)
  litros_entrada!: number;

  @ApiProperty({
    description: 'Litros de salida del tanque',
    example: 45.5,
  })
  @IsNumber()
  @Min(0)
  litros_salida!: number;

  @ApiProperty({
    description: 'Estado parcial del vehículo o la carga',
    example: 'Normal',
  })
  @IsString()
  @IsNotEmpty()
  estado_parcial!: string;
}
