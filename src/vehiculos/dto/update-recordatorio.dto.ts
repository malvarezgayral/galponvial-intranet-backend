import { IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateRecordatorioDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
