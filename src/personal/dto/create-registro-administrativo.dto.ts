// src/personal/dto/create-registro-administrativo.dto.ts
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
const TIPOS_DNI = ['DNI', 'LC', 'LE'];

export class CreateRegistroAdministrativoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  legajo?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  categoriaActual?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsIn(TIPOS_DNI)
  tipoDni?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDni?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroCuil?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  secretariaACargo?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  direccionACargo?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoCargo?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  areaEspecifica?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  antiguedad?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  fechaIngreso?: string | null;

  // Historial académico y de salud
  @Transform(vacioANull)
  @IsOptional()
  @IsIn(ESTUDIOS)
  estudiosAlcanzados?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titulo?: string | null;

  // Licencia anual
  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  licAnualFechaPresentada?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  licAnualAsunto?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(4)
  licAnualAnio?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  licAnualDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  licAnualHasta?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(10)
  licAnualDias?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  licAnualObservaciones?: string | null;

  // Licencia de conducir
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  licConducirCategoria?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  licConducirDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  licConducirHasta?: string | null;

  // Unidad a cargo
  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  unidadACargoDesde?: string | null;

  // Situación de revista
  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  plantaPermanenteDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  temporarioMensualizadoDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  destajistaDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  planesEmpleoDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  cooperativaDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  cargoTemporarioDesde?: string | null;

  @Transform(vacioANull)
  @IsOptional()
  @Matches(FECHA_REGEX, { message: FECHA_MSG })
  cargoTemporarioHasta?: string | null;
}
