/* eslint-disable prettier/prettier */
export enum UnidadTipo {
  PIEZA = 'pieza',
  CAJA = 'caja',
  PESO = 'peso',
  VOLUMEN = 'volumen',
  DISTANCIA = 'distancia',
  PAQUETE = 'paquete',
}

export enum MovimientoTipo {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
}

export enum UnidadCuantTipo {
  PESO = 'peso',
  VOLUMEN = 'volumen',
  DISTANCIA = 'distancia',
}

export enum EntradaTipo {
  COMPRA = 'compra',
  INVENTARIO_INICIAL = 'inventario inicial',
  CAMBIO = 'cambio',
  TRASPASO = 'traspaso',
  CAMBIO_UNIDAD = 'cambio de unidad',
  ALQUILER = 'alquiler',
}