import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserValidRoleGuard } from '../guards/user-valid-role.guard';
import { ScopedPermissionsGuard } from '../guards/scoped-permissions.guard';
import { ValidRoles } from '../enums/usuario.enum';
import { RoleProtected } from './role-protected.decorator';

/**
 * Decorator genérico que combina autenticación JWT + validación de rol +
 * permisos de scope específico (ej: lubricentro:write). Reutilizable para
 * cualquier módulo que necesite restringir una acción a un permiso puntual,
 * más allá del rol genérico (admin/superadmin).
 */
export function ScopedAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtAuthGuard, UserValidRoleGuard, ScopedPermissionsGuard),
  );
}
