import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { TipoServicio } from '../enums/vehiculo.enum';

export class CreateServicioDto {
  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @IsNotEmpty()
  @IsEnum(TipoServicio)
  tipo: TipoServicio;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  // Si no hay incidente, obligatoriamente debe haber id_vehiculo
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => !o.incidente_id)
  @IsNotEmpty({
    message: 'id_vehiculo es requerido si no se proporciona incidente_id',
  })
  @IsInt()
  id_vehiculo?: number;

  // El incidente es opcional
  @IsOptional()
  @IsInt()
  incidente_id?: number;
}
