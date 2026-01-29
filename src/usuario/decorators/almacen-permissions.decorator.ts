import { SetMetadata } from '@nestjs/common';
import { Permisos } from '../enums/usuario.enum';

export const ALMACEN_PERMISSIONS_KEY = 'almacen_permissions';

export function AlmacenPermissions(...permissions: Permisos[]) {
  return SetMetadata(ALMACEN_PERMISSIONS_KEY, permissions);
}
