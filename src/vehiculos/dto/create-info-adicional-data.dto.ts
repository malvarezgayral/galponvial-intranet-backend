import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sector } from '../entities/sector.entity';
import { Vehiculo } from '../entities/vehiculo.entity';

export class CreateInfoAdicionalDataDto {
  @ApiPropertyOptional({
    description: 'Número de serie del vehículo (dato viejo, ya no se carga)',
    example: 987654,
  })
  @IsOptional()
  @IsNumber()
  numero_serie?: number;

  @ApiProperty({ description: 'Número de motor', example: 'MOT123456' })
  @IsString()
  numero_motor: string;

  @ApiProperty({ description: 'Número de chasis', example: 'CHA987654' })
  @IsString()
  numero_chasis: string;

  @ApiProperty({
    description: 'Tipo de combustible',
    example: 'Diesel',
    enum: ['Diesel', 'Euro', 'Nafta'],
  })
  @IsString()
  tipo_combustible: string;

  @ApiProperty({ description: 'Patente (única)', example: 'AB123CD' })
  @IsString()
  patente: string;

  @ApiProperty({
    description: 'Licencia del conductor asignado',
    example: 'B1-23456789',
  })
  @IsString()
  licencia_conductor: string;

  @ApiProperty({ description: 'Categoría de la licencia', example: 'B1' })
  @IsString()
  licencia_categoria: string;

  @ApiProperty({ description: 'Clase de la licencia', example: 'Profesional' })
  @IsString()
  licencia_clase: string;

  @ApiProperty({
    description: 'Vencimiento de la licencia (YYYY-MM-DD)',
    example: '2028-08-08',
  })
  @IsString()
  licencia_vencimiento: string;

  @ApiProperty({
    description: 'Color del vehículo',
    example: 'Blanco',
  })
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Empresa aseguradora',
    example: 'La Caja',
  })
  @IsString()
  seguro_empresa: string;

  @ApiProperty({
    description: 'Número de póliza del seguro',
    example: 'POL-2024-9988',
  })
  @IsString()
  poliza: string;

  @ApiPropertyOptional({
    description: 'Vehículo asociado',
  })
  vehiculo: Vehiculo;

  @ApiPropertyOptional({
    description: 'Sector al que pertenece el vehículo',
  })
  @IsOptional()
  sector?: Sector;
}
