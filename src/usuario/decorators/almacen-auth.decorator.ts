import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserValidRoleGuard } from '../guards/user-valid-role.guard';
import { AlmacenPermissionsGuard } from '../guards/almacen-permissions.guard';
import { ValidRoles } from '../enums/usuario.enum';
import { RoleProtected } from './role-protected.decorator';

/**
 * Decorator que combina autenticación JWT + validación de rol + permisos de almacén.
 * El orden de los guards es crítico: primero JWT, luego roles, luego permisos.
 */
export function AlmacenAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtAuthGuard, UserValidRoleGuard, AlmacenPermissionsGuard),
  );
}
