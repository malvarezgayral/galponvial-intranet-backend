import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehiculoStatus, TipoVehiculo } from '../enums/vehiculo.enum';
import { InfoAdicionalDto } from './info-adicional.dto';

export class CreateVehiculoDto {
  @ApiProperty({ example: 'CAM-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Camión Iveco' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Iveco' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  marca: string;

  @ApiProperty({ example: 'Tector 170E' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  modelo: string;

  @ApiProperty({ example: 2022 })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @ApiProperty({
    enum: TipoVehiculo,
    example: TipoVehiculo.CAMION,
  })
  @IsEnum(TipoVehiculo)
  tipo_vehiculo: TipoVehiculo;

  @ApiPropertyOptional({
    enum: VehiculoStatus,
    example: VehiculoStatus.DISPONIBLE,
  })
  @IsEnum(VehiculoStatus)
  @IsOptional()
  status?: VehiculoStatus;

  @ApiPropertyOptional({ example: 12.5 })
  @IsNumber()
  @Min(0)
  uso_combustible: number;

  @ApiPropertyOptional({ example: 150000 })
  @IsNumber()
  @Min(0)
  uso_km: number;

  @ApiPropertyOptional({ example: 'Delegación Centro' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  delegacion?: string;

  @ApiProperty({
    type: () => InfoAdicionalDto,
  })
  @ValidateNested()
  @Type(() => InfoAdicionalDto)
  @IsNotEmpty()
  infoAdicional: InfoAdicionalDto;
}
