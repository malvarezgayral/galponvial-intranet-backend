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

export enum ValidRoles {
  admin = 'admin', //all permissions (write/read)
  superUser = 'superuser', //some permissions
  user = 'user', //basic permissions (read-only)
}

export enum FallaIncidente {
  CRITICA = 'critica',
  MODERADA = 'moderada',
  BAJA = 'baja',
}
