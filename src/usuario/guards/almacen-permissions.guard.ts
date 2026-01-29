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
import { ALMACEN_PERMISSIONS_KEY } from '../decorators/almacen-permissions.decorator';
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

    // Si no hay permisos requeridos especificados, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) throw new BadRequestException('User not found');
    if (!user.rol) throw new BadRequestException('User role not found');

    const userPermissions = user.rol.permisos || [];

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (hasPermission) {
      return true;
    }

    throw new ForbiddenException(
      `User ${user.nombre} does not have required permissions: ${requiredPermissions.join(', ')}`,
    );
  }
}
