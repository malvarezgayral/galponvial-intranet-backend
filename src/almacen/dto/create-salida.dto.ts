import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SalidaTipo } from '../entities/salida.entity';

export class CreateSalidaDto {
  @ApiProperty({
    enum: SalidaTipo,
    example: SalidaTipo.CONSUMO,
  })
  @IsEnum(SalidaTipo)
  tipo: SalidaTipo;

  @ApiPropertyOptional({
    example: 'Salida por uso interno',
  })
  @IsOptional()
  @IsString()
  detalle?: string;

  @ApiProperty({
    example: 'Uso en mantenimiento',
  })
  @IsString()
  @IsNotEmpty()
  motivo_salida: string;

  @ApiPropertyOptional({
    example: 'Mantenimiento preventivo',
  })
  @IsOptional()
  @IsString()
  detalle_motivo?: string;

  @ApiProperty({
    description: 'Código del artículo',
    example: 1001,
  })
  @IsString()
  @IsNotEmpty()
  cod_articulo: number;
}
