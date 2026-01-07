export enum Permisos {
  escritura = 'write',
  lectura = 'read',
  lectoEscritura = 'write-read',
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
