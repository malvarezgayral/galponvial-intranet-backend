import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import {
  SCOPED_PERMISSIONS_KEY,
  SCOPED_READ_PERMISSIONS_KEY,
} from '../decorators/scoped-permissions.decorator';
import { Usuario } from '../entities/usuario.entity';
import { Permisos } from '../enums/usuario.enum';

interface RequestWithUser extends Request {
  user: Usuario;
}

// Permisos de escritura que tambien acepta all:write como comodin.
// Personal y Lubricentro quedan afuera a proposito.
const PERMISOS_CON_COMODIN_ALL_WRITE: Permisos[] = [
  Permisos.COMBUSTIBLE_WRITE,
  Permisos.SERVICE_WRITE,
];

@Injectable()
export class ScopedPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions: Permisos[] = this.reflector.get(
      SCOPED_PERMISSIONS_KEY,
      context.getHandler(),
    );

    const requiredReadPermissions: Permisos[] = this.reflector.get(
      SCOPED_READ_PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (
      (!requiredPermissions || requiredPermissions.length === 0) &&
      (!requiredReadPermissions || requiredReadPermissions.length === 0)
    )
      return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) throw new BadRequestException('User not found');

    if (!user.usuarioRoles || user.usuarioRoles.length === 0)
      throw new BadRequestException('User roles not found');

    const userRoles = user.roles ?? [];
    if (userRoles.length === 0)
      throw new BadRequestException('User roles not found');

    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllWrite = userPermissions.includes(Permisos.ALL_WRITE);
      const hasWritePermission = requiredPermissions.some(
        (permission) =>
          userPermissions.includes(permission) ||
          (hasAllWrite && PERMISOS_CON_COMODIN_ALL_WRITE.includes(permission)),
      );

      if (!hasWritePermission) {
        throw new ForbiddenException(
          `User ${user.nombre} does not have required write permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    if (requiredReadPermissions && requiredReadPermissions.length > 0) {
      const hasReadPermission = requiredReadPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasReadPermission) {
        throw new ForbiddenException(
          `User ${user.nombre} does not have required read permissions: ${requiredReadPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
