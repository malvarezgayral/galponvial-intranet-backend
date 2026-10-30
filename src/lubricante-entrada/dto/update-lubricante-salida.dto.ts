// src/lubricante-entrada/dto/update-lubricante-salida.dto.ts
import { IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateLubricanteSalidaDto {
  @IsNumber()
  @Min(0)
  cantidadSalida!: number;

  @IsDateString()
  fechaEstado!: string;
}
