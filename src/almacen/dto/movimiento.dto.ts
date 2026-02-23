import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { MovimientoTipo } from '../enums/almacen.enum';

export class MovimientoDTO {
  @ApiProperty({
    enum: MovimientoTipo,
    example: MovimientoTipo.ENTRADA,
  })
  @IsEnum(MovimientoTipo)
  tipoMovimiento: MovimientoTipo;

  @ApiProperty({
    example: '2025-01-01T10:00:00.000Z',
  })
  @IsDate()
  fecha: Date;

  @ApiProperty({
    example: 1001,
  })
  @IsNotEmpty()
  @IsNumber()
  codArticulo: number;

  @ApiProperty({
    example: 40123456,
  })
  @IsNotEmpty()
  @IsNumber()
  dniUsuario: number;

  @ApiProperty({
    example: 'Ingreso por compra',
  })
  @IsNotEmpty()
  @IsString()
  motivo: string;

  @ApiProperty({
    example: 'Compra mensual',
  })
  @IsString()
  detalle: string;

  // Nuevos campos agregados:
  @ApiPropertyOptional({
    example: 'Proveedor SA',
  })
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional({
    example: 'Uso en obra',
  })
  @IsOptional()
  @IsString()
  motivo_salida?: string;

  @ApiPropertyOptional({
    example: 'Se entregó a Juan Pérez',
  })
  @IsOptional()
  @IsString()
  detalle_motivo?: string;
}
