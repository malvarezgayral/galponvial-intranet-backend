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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidRoles, FallaIncidente } from '../enums/usuario.enum';

/* =========================
   CREATE USUARIO
========================= */
export class CreateUsuarioDto {
  @ApiProperty({
    description: 'DNI del usuario',
    example: 40123456,
  })
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@email.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (mínimo una mayúscula, una minúscula y un número)',
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'Repetición de la contraseña',
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  repeatedPassword: string;
}

/* =========================
   UPDATE USUARIO
========================= */
export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del usuario',
    example: 'Carlos',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nuevo apellido del usuario',
    example: 'Gómez',
  })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Fecha de baja del usuario',
    example: '2025-01-10',
  })
  @IsOptional()
  @IsDateString()
  fecha_baja?: string;

  @ApiPropertyOptional({
    description: 'ID del rol asignado',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  rol_id?: number;
}

/* =========================
   ASSIGN ROL
========================= */
export class AssignRolDto {
  @ApiProperty({
    description: 'Rol a asignar al usuario',
    enum: ValidRoles,
    example: ValidRoles.admin,
  })
  @IsNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  rol: ValidRoles;
}

/* =========================
   USUARIO - VEHICULO
========================= */
export class CreateUsuarioVehiculoDto {
  @ApiProperty({
    description: 'ID del vehículo asignado',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @ApiProperty({
    description: 'Fecha desde la cual se asigna el vehículo',
    example: '2024-10-01',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_desde: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta la cual se asigna el vehículo',
    example: '2025-03-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}

/* =========================
   REPORTE INCIDENTE
========================= */
export class CreateReporteIncidenteDto {
  @ApiProperty({
    description: 'Fecha del incidente',
    example: '2025-02-15',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Tipo de incidente',
    example: 'Mecánico',
  })
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Descripción del incidente',
    example: 'Falla en el sistema de frenos',
  })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Nivel de falla o importancia',
    enum: FallaIncidente,
  })
  @IsNotEmpty()
  @IsEnum(FallaIncidente)
  falla: FallaIncidente;

  @ApiProperty({
    description: 'ID del usuario que reporta',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @ApiProperty({
    description: 'ID del vehículo afectado',
    example: 8,
  })
  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;
}

/* =========================
   SERVICIO
========================= */
export class CreateServicioDto {
  @ApiProperty({
    description: 'Tipo de servicio realizado',
    example: 'Mantenimiento preventivo',
  })
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Fecha de inicio del servicio',
    example: '2025-01-05',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha de finalización del servicio',
    example: '2025-01-06',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha_hasta: string;

  @ApiProperty({
    description: 'Descripción del servicio',
    example: 'Cambio de aceite y filtros',
  })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({
    description: 'ID del incidente asociado (si aplica)',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  incidente_id?: number;
}
