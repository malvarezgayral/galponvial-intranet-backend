import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Permisos, ValidRoles, FallaIncidente } from '../enums/usuario.enum';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsNumber()
  dni: number; //verificar que sea un dni valido

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  repeatedPassword: string;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password?: string;

  @IsOptional()
  @IsNumber()
  tokenVersion?: number;

  @IsOptional()
  @IsEnum(ValidRoles)
  rol?: ValidRoles;
}

export class AssignRolDto {
  @IsNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  rol: ValidRoles;
}

export class CreateUsuarioVehiculoDto {
  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;

  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_desde: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}

export class CreateReporteIncidenteDto {
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsEnum(FallaIncidente)
  falla: FallaIncidente;

  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;
}

export class CreateServicioDto {
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_hasta: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsNumber()
  incidente_id?: number;
}
