export enum Permisos {
  // Permisos de almacén
  ALMACEN_TALLER_READ = 'almacen-taller:read',
  ALMACEN_TALLER_WRITE = 'almacen-taller:write',
  ALMACEN_COMUN_READ = 'almacen-comun:read',
  ALMACEN_COMUN_WRITE = 'almacen-comun:write',
  // Permisos generales
  ALL_WRITE = 'all:write',
  ALL_READ = 'all:read',
  // Permisos de Lubricentro
  LUBRICENTRO_READ = 'lubricentro:read',
  LUBRICENTRO_WRITE = 'lubricentro:write',
  // Permisos de Personal
  PERSONAL_READ = 'personal:read',
  PERSONAL_WRITE = 'personal:write',
  // Permisos de Combustible
  COMBUSTIBLE_WRITE = 'combustible:write',
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
