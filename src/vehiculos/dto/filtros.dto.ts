import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { StatusIncidente } from '../enums/vehiculo.enum';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

export class FiltrosCombustibleDto {
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}

export class FiltrosIncidenteDto {
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsOptional()
  @IsEnum(StatusIncidente)
  status?: StatusIncidente;

  @IsOptional()
  @IsEnum(FallaIncidente)
  importancia?: FallaIncidente;
}
