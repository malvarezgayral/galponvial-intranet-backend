// src/mensajes-privados/dto/create-mensaje-privado.dto.ts
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateMensajePrivadoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El asunto no puede estar vacio' })
  @MaxLength(150)
  asunto!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El mensaje no puede estar vacio' })
  @MaxLength(2000)
  texto!: string;
}
