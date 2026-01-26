import { IsOptional, IsDateString, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusIncidente } from '../enums/vehiculo.enum';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

export class FiltrosCombustibleDto {
  @ApiPropertyOptional({ example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({ example: 5 }) // ← AGREGAR
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vehiculoId?: number;
}

export class FiltrosIncidenteDto {
  @ApiPropertyOptional({ example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({
    enum: StatusIncidente,
    example: StatusIncidente.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(StatusIncidente)
  status?: StatusIncidente;

  @ApiPropertyOptional({
    enum: FallaIncidente,
    example: FallaIncidente.BAJA,
  })
  @IsOptional()
  @IsEnum(FallaIncidente)
  importancia?: FallaIncidente;
}