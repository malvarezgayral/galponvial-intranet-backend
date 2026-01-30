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
import { ALMACEN_PERMISSIONS_KEY, ALMACEN_READ_PERMISSIONS_KEY } from '../decorators/almacen-permissions.decorator';
import { Usuario } from '../entities/usuario.entity';
import { Permisos } from '../enums/usuario.enum';

interface RequestWithUser extends Request {
  user: Usuario;
}

@Injectable()
export class AlmacenPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions: Permisos[] = this.reflector.get(
      ALMACEN_PERMISSIONS_KEY,
      context.getHandler(),
    );

    const requiredReadPermissions: Permisos[] = this.reflector.get(
      ALMACEN_READ_PERMISSIONS_KEY,
      context.getHandler(),
    );

    // Si no hay permisos requeridos especificados, permitir acceso
    if (
      (!requiredPermissions || requiredPermissions.length === 0) &&
      (!requiredReadPermissions || requiredReadPermissions.length === 0)
    )
      return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) throw new BadRequestException('User not found');
    if (!user.roles || user.roles.length === 0)
      throw new BadRequestException('User roles not found');

    // Combinar permisos de todos los roles del usuario
    const userRoles = user.roles ?? [];
    const userPermissions: Permisos[] = userRoles.flatMap(
      (role) => role.permisos ?? [],
    );

    // Verificar permisos de escritura
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasWritePermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasWritePermission) {
        throw new ForbiddenException(
          `User ${user.nombre} does not have required write permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    // Verificar permisos de lectura
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
