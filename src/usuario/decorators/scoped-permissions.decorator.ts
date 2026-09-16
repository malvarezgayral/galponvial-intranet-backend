import { SetMetadata } from '@nestjs/common';
import { Permisos } from '../enums/usuario.enum';

export const SCOPED_PERMISSIONS_KEY = 'scoped_permissions';
export const SCOPED_READ_PERMISSIONS_KEY = 'scoped_read_permissions';

export function ScopedPermissions(...permissions: Permisos[]) {
  return SetMetadata(SCOPED_PERMISSIONS_KEY, permissions);
}

export function ScopedReadPermissions(...permissions: Permisos[]) {
  return SetMetadata(SCOPED_READ_PERMISSIONS_KEY, permissions);
}
