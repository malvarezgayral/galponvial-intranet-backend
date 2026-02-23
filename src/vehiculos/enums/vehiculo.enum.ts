export enum VehiculoStatus {
  DISPONIBLE = 'disponible',
  EN_TALLER = 'en_taller',
  FUERA_DE_SERVICIO = 'fuera_de_servicio',
  EN_USO = 'en_uso',
}

export enum TipoVehiculo {
  TRASLADO = 'TRASLADO',
  PLAYO = 'PLAYO',
  RETRO_A_ORUGAS = 'RETRO A ORUGAS',
  VOLCADOR = 'VOLCADOR',
  COLECTIVO = 'COLECTIVO',
  HIDROGRUA = 'Hidrogrúa',
  MOTONIVELADORA = 'MOTONIVELADORA',
  PALA_RETRO = 'PALA / RETRO',
  TRACTOR = 'TRACTOR',
  AMBULANCIA = 'AMBULANCIA',
  CUATRO_X_CUATRO = '4X4',
  PALA_FRONTAL = 'PALA FRONTAL',
  RIEGO = 'RIEGO',
  MINIBUS = 'MINIBUS',
  COMPACTADOR_RESIDUOS = 'COMPACTADOR RESIDUOS',
  CAMION = 'CAMION',
  AUTO = 'AUTO',
  OTRO = 'otro',
}

export enum TipoIncidente {
  MECANICO = 'mecanico',
  ELECTRICO = 'electrico',
  ACCIDENTE = 'accidente',
  DESGASTE = 'desgaste',
  OTRO = 'otro',
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
