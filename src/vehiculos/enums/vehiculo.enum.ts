export enum VehiculoStatus {
  DISPONIBLE = 'disponible',
  EN_TALLER = 'en_taller',
  FUERA_DE_SERVICIO = 'fuera_de_servicio',
  EN_USO = 'en_uso',
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

export enum UnidadMedidaUso {
  KILOMETROS = 'kilometros',
  HORAS = 'horas',
  DIAS = 'dias',
}

export enum UnidadMedidaCombustible {
  LITROS = 'litros',
  GALONES = 'galones',
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