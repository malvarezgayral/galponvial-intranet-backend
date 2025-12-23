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
import { Type } from 'class-transformer';
import { VehiculoStatus, TipoVehiculo } from '../enums/vehiculo.enum';
import { InfoAdicionalDto } from './info-adicional.dto';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La marca es requerida' })
  @MaxLength(50)
  marca: string;

  @IsString()
  @IsNotEmpty({ message: 'El modelo es requerido' })
  @MaxLength(50)
  modelo: string;

  @IsNumber()
  @Min(1900, { message: 'El año debe ser mayor a 1900' })
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @IsEnum(TipoVehiculo)
  tipo_vehiculo: TipoVehiculo;

  @IsEnum(VehiculoStatus)
  @IsOptional()
  status?: VehiculoStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  uso_combustible?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  uso_km?: number;

  @ValidateNested()
  @Type(() => InfoAdicionalDto)
  @IsNotEmpty()
  infoAdicional: InfoAdicionalDto;
}
