import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserValidRoleGuard } from '../guards/user-valid-role.guard';
import { ValidRoles } from '../enums/usuario.enum';
import { RoleProtected } from './role-protected.decorator';
import { TokenTypeGuard } from '../guards/token-type.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserValidRoleGuard, TokenTypeGuard),
  );
}
