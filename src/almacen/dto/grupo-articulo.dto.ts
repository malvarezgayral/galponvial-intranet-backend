/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateArticuloDto } from './create-articulo.dto';

export class GrupoArticuloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNotEmpty()
  sector_id: number;

  articulos: Array<CreateArticuloDto>;
}
