/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EntradaTipo } from '../enums/almacen.enum';

export class CreateEntradaDto {
  @IsEnum(EntradaTipo)
  tipo: EntradaTipo;

  @IsString()
  @IsNotEmpty()
  detalle: string;

  @IsString()
  @IsNotEmpty()
  proveedor: string;

  @IsString()
  @IsNotEmpty()
  cod_articulo: string;
}
