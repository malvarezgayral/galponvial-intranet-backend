import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { FallaIncidente } from 'src/usuario/enums/usuario.enum';

export class CreateReporteIncidenteDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(FallaIncidente)
  @IsNotEmpty()
  falla: FallaIncidente;

  @IsNumber()
  @IsNotEmpty()
  id_vehiculo: number;
}
