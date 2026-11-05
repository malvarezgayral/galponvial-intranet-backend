// src/mensajes-privados/dto/enviar-chat.dto.ts
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class EnviarChatDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El mensaje no puede estar vacio' })
  @MaxLength(2000)
  texto!: string;
}
