export enum RolTipo {
  CONDUCTOR = 'conductor',
  ADMINISTRADOR = 'administrador',
  MODERADOR = 'moderador',
}

export enum ValidRoles {
  admin = 'admin', //all permissions (write/read)
  superUser = 'super-user', //some permissions
  user = 'user', //basic permissions (read-only)
}

export enum FallaIncidente {
  CRITICA = 'critica',
  MODERADA = 'moderada',
  BAJA = 'baja',
}
