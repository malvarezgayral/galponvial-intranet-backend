import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateCombustibleCargaDto {
  @IsDateString()
  @IsNotEmpty()
  fecha_carga: string;

  @IsNumber()
  @IsNotEmpty()
  id_vehiculo: number;

  @IsString()
  @IsOptional()
  despachante?: string;

  @IsNumber()
  @Min(0)
  km_actual: number;

  @IsNumber()
  @Min(0)
  cant_combustible_despachado: number;

  // id_usuario se obtendrá del token JWT cuando tengamos autenticación
}