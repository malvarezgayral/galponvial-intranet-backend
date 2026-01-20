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
import { META_ROLES } from '../decorators/role-protected.decorator';
import { Usuario } from '../entities/usuario.entity';

interface RequestWithUser extends Request {
  user: Usuario;
}

@Injectable()
export class UserValidRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    if (!user) throw new BadRequestException('User not found');

    if (!user.rol) throw new BadRequestException('User role not found');

    if (validRoles.includes(user.rol.rol)) {
      return true;
    }

    validRoles.join(', ');

    throw new ForbiddenException(
      `User ${user.nombre} need a valid role: ${validRoles.join(', ')}`,
    );
  }
}
