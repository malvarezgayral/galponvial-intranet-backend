import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class InfoAdicionalDto {
  @IsOptional()
  @IsNumber()
  numero_serie?: number;

  @IsOptional()
  @IsString()
  licencia_conductor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsString()
  @IsNotEmpty()
  seguro_empresa: string;

  @IsString()
  @IsNotEmpty()
  poliza: string;

  @IsNumber()
  @IsNotEmpty()
  id_sector_pertenencia: number;
}
