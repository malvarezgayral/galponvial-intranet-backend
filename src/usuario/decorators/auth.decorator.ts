import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserValidRoleGuard } from '../guards/user-valid-role.guard';
import { ValidRoles } from '../enums/usuario.enum';
import { RoleProtected } from './role-protected.decorator';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserValidRoleGuard),
  );
}

/*export function AuthRolePresence() {
  return applyDecorators(UseGuards(AuthGuard(), UserPresenceRoleGuard));
}
*/
