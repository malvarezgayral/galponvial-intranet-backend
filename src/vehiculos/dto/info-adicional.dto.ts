import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InfoAdicionalDto {
  @ApiPropertyOptional({ example: 123456 })
  @IsOptional()
  @IsNumber()
  numero_serie?: number;

  @ApiProperty({ example: 'MOT123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_motor: string;

  @ApiProperty({ example: 'CHA987654' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numero_chasis: string;

  @ApiProperty({ example: 'Diesel', enum: ['Diesel', 'Euro', 'Nafta'] })
  @IsString()
  @IsIn(['Diesel', 'Euro', 'Nafta'])
  tipo_combustible: string;

  @ApiProperty({ example: 'AB123CD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  patente: string;

  @ApiPropertyOptional({ example: 'B1-12345678' })
  @IsOptional()
  @IsString()
  licencia_conductor?: string;

  @ApiProperty({ example: 'B1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  licencia_categoria: string;

  @ApiProperty({ example: 'Profesional' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  licencia_clase: string;

  @ApiProperty({ example: '2028-08-08', description: 'Formato YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'licencia_vencimiento debe tener formato YYYY-MM-DD',
  })
  licencia_vencimiento: string;

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
