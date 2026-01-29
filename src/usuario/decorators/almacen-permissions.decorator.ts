import { SetMetadata } from '@nestjs/common';
import { Permisos } from '../enums/usuario.enum';

export const ALMACEN_PERMISSIONS_KEY = 'almacen_permissions';
export const ALMACEN_READ_PERMISSIONS_KEY = 'almacen_read_permissions';

export function AlmacenPermissions(...permissions: Permisos[]) {
  return SetMetadata(ALMACEN_PERMISSIONS_KEY, permissions);
}

export function AlmacenReadPermissions(...permissions: Permisos[]) {
  return SetMetadata(ALMACEN_READ_PERMISSIONS_KEY, permissions);
}
