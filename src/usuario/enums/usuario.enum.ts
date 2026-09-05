export enum Permisos {
  // Permisos de almacén
  ALMACEN_TALLER_READ = 'almacen-taller:read',
  ALMACEN_TALLER_WRITE = 'almacen-taller:write',
  ALMACEN_COMUN_READ = 'almacen-comun:read',
  ALMACEN_COMUN_WRITE = 'almacen-comun:write',
  // Permisos generales
  ALL_WRITE = 'all:write',
  ALL_READ = 'all:read',
}

// Alias para ValidPermissions (mismo que Permisos)
export const ValidPermissions = Permisos;

export enum ValidRoles {
  superadmin = 'superadmin', //unique singleton, all permissions (write/read)
  admin = 'admin', //all permissions (write/read)
  user = 'user', //basic permissions (read-only)
}

export enum FallaIncidente {
  CRITICA = 'critica',
  MODERADA = 'moderada',
  BAJA = 'baja',
}
