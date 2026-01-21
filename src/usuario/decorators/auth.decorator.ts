import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserValidRoleGuard } from '../guards/user-valid-role.guard';
import { ValidRoles } from '../enums/usuario.enum';
import { RoleProtected } from './role-protected.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtAuthGuard, UserValidRoleGuard),
  );
}
