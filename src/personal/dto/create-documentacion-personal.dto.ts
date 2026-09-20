// src/personal/dto/create-documentacion-personal.dto.ts
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const vacioANull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_MSG = 'La fecha debe tener formato AAAA-MM-DD';
const ESTUDIOS = ['Primario', 'Secundario', 'Terciario', 'Universitario'];

export class CreateDocumentacionPersonalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numeroDocumento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numeroCuil!: string;

  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaNacimiento!: string;

  // Domicilio actual
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  direccion?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  piso?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefonoContacto?: string | null;

  // Historial académico
  @Transform(vacioANull)
  @IsOptional()
  @IsIn(ESTUDIOS)
  estudiosAlcanzados?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titulo?: string | null;

  // Historial de salud
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  preocupacional?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaPreocupacional?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  constanciaAptitudFisica?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaConstanciaAptitudFisica?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  examenesMedicos?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaExamenesMedicos?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  examenesMedicosArt?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaExamenesMedicosArt?: string | null;
}
