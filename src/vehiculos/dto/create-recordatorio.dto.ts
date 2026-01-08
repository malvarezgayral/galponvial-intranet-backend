import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateRecordatorioDto {
  @IsDateString()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
