import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sector } from '../entities/sector.entity';
import { Vehiculo } from '../entities/vehiculo.entity';

export class CreateInfoAdicionalDataDto {
  @ApiProperty({
    description: 'Número de serie del vehículo',
    example: 987654,
  })
  @IsNumber()
  numero_serie: number;

  @ApiProperty({
    description: 'Licencia del conductor asignado',
    example: 'B1-23456789',
  })
  @IsString()
  licencia_conductor: string;

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
