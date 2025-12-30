import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Sector } from '../entities/sector.entity';
import { Vehiculo } from '../entities/vehiculo.entity';

export class CreateInfoAdicionalDataDto {
  @IsNumber()
  numero_serie: number;

  @IsString()
  licencia_conductor: string;

  @IsString()
  color: string;

  @IsString()
  seguro_empresa: string;

  @IsString()
  poliza: string;

  vehiculo: Vehiculo;

  @IsOptional()
  sector?: Sector;
}