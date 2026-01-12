import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InfoAdicionalDto {
  @ApiPropertyOptional({ example: 123456 })
  @IsOptional()
  @IsNumber()
  numero_serie?: number;

  @ApiPropertyOptional({ example: 'B1-12345678' })
  @IsOptional()
  @IsString()
  licencia_conductor?: string;

  @ApiPropertyOptional({ example: 'Rojo' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiProperty({ example: 'San Cristóbal' })
  @IsString()
  @IsNotEmpty()
  seguro_empresa: string;

  @ApiProperty({ example: 'POL-998877' })
  @IsString()
  @IsNotEmpty()
  poliza: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @IsNotEmpty()
  id_sector_pertenencia: number;
}
