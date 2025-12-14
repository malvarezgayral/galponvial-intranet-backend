export enum VehiculoStatus {
  DISPONIBLE = 'disponible',
  EN_TALLER = 'en taller',
  FUERA_DE_SERVICIO = 'fuera de servicio',
  EN_USO = 'en uso',
}

export enum TipoVehiculo {
  AUTOMOVIL = 'automovil',
  CAMION = 'camion',
  CAMIONETA = 'camioneta',
  RETROEXCAVADORA = 'retroexcavadora',
  MAQUINARIA = 'maquinaria',
  MOTOCICLETA = 'motocicleta',
  OTRO = 'otro',
}

export enum TipoIncidente {
  MECANICO = 'mecanico',
  ELECTRICO = 'electrico',
  ACCIDENTE = 'accidente',
  DESGASTE = 'desgaste',
  OTRO = 'otro',
}

export enum CriticidadIncidente {
  CRITICA = 'critica',
  MODERADA = 'moderada',
  BAJA = 'baja',
}

export enum StatusIncidente {
  PENDIENTE = 'pendiente',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
}

export enum TipoServicio {
  MANTENIMIENTO_PREVENTIVO = 'mantenimiento_preventivo',
  MANTENIMIENTO_CORRECTIVO = 'mantenimiento_correctivo',
  REPARACION = 'reparacion',
  REVISION = 'revision',
  CAMBIO_ACEITE = 'cambio_aceite',
  CAMBIO_NEUMATICOS = 'cambio_neumaticos',
  OTRO = 'otro',
}
