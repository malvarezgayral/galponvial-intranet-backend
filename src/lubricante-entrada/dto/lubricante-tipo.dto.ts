// src/lubricante-entrada/dto/lubricante-tipo.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Alta o edición de un tipo de lubricante de la lista. */
export class LubricanteTipoDto {
  @IsString()
  @IsNotEmpty({ message: 'Completá el nombre del lubricante.' })
  @MaxLength(100, { message: 'El nombre puede tener hasta 100 caracteres.' })
  nombre!: string;
}
