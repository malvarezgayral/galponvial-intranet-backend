/* eslint-disable prettier/prettier */
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MovimientoTipo } from '../enums/almacen.enum';

export class MovimientoDTO {
  @IsEnum(MovimientoTipo)
  tipoMovimiento: MovimientoTipo;

  @IsDate()
  fecha: Date;

  @IsNotEmpty()
  @IsString()
  codArticulo: string;

  @IsNotEmpty()
  @IsNumber()
  dniUsuario: number;

  @IsNotEmpty()
  @IsString()
  motivo: string;

  @IsString()
  detalle: string;
}
