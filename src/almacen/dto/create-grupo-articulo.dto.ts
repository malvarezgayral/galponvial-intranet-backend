/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString} from 'class-validator';

export class CreateGrupoArticuloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNotEmpty()
  sector_id: number;
}
