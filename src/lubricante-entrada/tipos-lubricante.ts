// src/lubricante-entrada/tipos-lubricante.ts
/**
 * Lista fija de lubricantes. Se usa en Agregar y Editar Lubricante (tipo),
 * en Registro de Lubricantes (lubricante) y en el filtro del historial.
 * El orden es el acordado con el usuario el 25/11/2026.
 */
export const TIPOS_LUBRICANTE = [
  'ATF 17',
  '15 W 40 COMUN',
  '15 W 40 MULTIGRADO',
  '15 W 40 EXTRA VIDA',
  'HIDRAULICO 68',
  'HY GARD',
  '10 W 30',
  'SAE 40',
  '85 W 140',
  'PLUS 50 II',
  '80 W 90',
] as const;
