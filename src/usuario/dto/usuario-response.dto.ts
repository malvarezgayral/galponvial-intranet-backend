import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '../entities/rol.entity';

/**
 * DTO de respuesta para UsuarioRol sin datos redundantes
 */
export class UsuarioRolResponseDto {
  @ApiProperty({
    description: 'Fecha de asignación del rol',
  })
  fecha_asignacion: Date;

  @ApiProperty({
    description: 'Fecha de actualización del rol',
  })
  fecha_actualizacion: Date;

  @ApiProperty({
    description: 'Información del rol',
    type: () => Rol,
  })
  rol: Rol;
}

/**
 * DTO de respuesta para Usuario sin datos sensibles (password, tokenVersion, etc)
 */
export class UsuarioResponseDto {
  @ApiProperty({
    description: 'DNI del usuario',
    example: 40123456,
    nullable: true,
  })
  dni: number | null;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  apellido: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de alta del usuario',
  })
  fecha_alta?: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha de baja del usuario',
  })
  fecha_baja?: Date | null;

  @ApiPropertyOptional({
    description: 'Roles asignados al usuario',
    type: () => [UsuarioRolResponseDto],
  })
  usuarioRoles?: UsuarioRolResponseDto[];
}

/**
 * DTO de respuesta para Usuario con información mínima
 */
export class UsuarioMinimalResponseDto {
  @ApiProperty({
    description: 'DNI del usuario',
    example: 40123456,
    nullable: true,
  })
  dni: number | null;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  apellido: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@email.com',
  })
  email: string;
}
