// src/lubricante-entrada/tipos-lubricante.ts
/**
 * Lista fija de lubricantes. Se usa en Agregar y Editar Lubricante (tipo),
 * en Registro de Lubricantes (lubricante) y en el filtro del historial.
 * Orden alfabético, con los números primero (pedido del usuario, 25/11/2026).
 */
export const TIPOS_LUBRICANTE = [
  '10 W 30',
  '15 W 40 COMUN',
  '15 W 40 EXTRA VIDA',
  '15 W 40 MULTIGRADO',
  '80 W 90',
  '85 W 140',
  'ACEITE DE MOTOR CATERPILLAR',
  'ACEITE HIDRÁULICO CATERPILLAR',
  'ATF 17',
  'ELAION 5 W 30 SINTÉTICO',
  'ELAION 10 W 40 SEMI-SINTÉTICO',
  'ELAION AURO 5 W 30',
  'HIDRAULICO 68',
  'HY GARD',
  'PLUS 50 II',
  'SAE 40',
] as const;
