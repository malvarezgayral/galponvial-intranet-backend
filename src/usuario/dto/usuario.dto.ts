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
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidRoles } from '../enums/usuario.enum';

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
    description: 'Email del usuario',
    example: 'carlos.gomez@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description:
      'Contraseña del usuario (mínimo una mayúscula, una minúscula y un número)',
    example: 'Password123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Versión del token del usuario',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tokenVersion?: number;

  @ApiPropertyOptional({
    description: 'Array de IDs de roles a asignar al usuario',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  rol_ids?: number[];
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
