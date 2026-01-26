import { ApiProperty } from '@nestjs/swagger';

export class CombustibleCargaResponseDto {
  @ApiProperty({ example: 'Camión Iveco - ABC123' })
  vehiculo: string;

  @ApiProperty({ example: '2025-01-12' })
  fecha: string;

  @ApiProperty({ example: 'Juan Pérez' })
  despachante: string;

  @ApiProperty({ example: 'Carlos González' })
  operador: string;

  @ApiProperty({ example: 45200 })
  km_actual: number;

  @ApiProperty({ example: 120 })
  litros: number;

  @ApiProperty({ example: 480 })
  recorrido: number;

  @ApiProperty({ example: 4.0 })
  rendimiento: number;
}