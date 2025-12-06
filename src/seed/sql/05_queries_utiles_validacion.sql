-- ============================================================
-- GUÍA RÁPIDA DE QUERIES ÚTILES PARA VALIDAR SEED
-- ============================================================

-- ============================================================
-- LISTAR TODOS LOS VEHÍCULOS CON SU INFORMACIÓN
-- ============================================================
SELECT 
  v.id_vehiculo,
  v.nombre,
  v.marca,
  v.modelo,
  v.status,
  i.color,
  i.licencia_conductor,
  s.nombre as sector
FROM vehiculo v
LEFT JOIN info_adicional i ON v.id_vehiculo = i.id_vehiculo
LEFT JOIN sector s ON i.id_sector_pertenencia = s.id_sector
ORDER BY v.id_vehiculo;

-- ============================================================
-- LISTAR ARTÍCULOS CON SU GRUPO Y SECTOR
-- ============================================================
SELECT 
  a.cod,
  a.nombre,
  a.modelo,
  g.nombre as grupo,
  sg.descripcion as sector
FROM articulo a
LEFT JOIN grupo_articulo g ON a.grupo_id = g.id
LEFT JOIN sector_galpon sg ON g.ubicacion = sg.id
ORDER BY a.nombre;

-- ============================================================
-- MOVIMIENTOS DE INVENTARIO CON DETALLES
-- ============================================================
SELECT 
  m.id,
  m.tipo as movimiento_tipo,
  m.fecha,
  a.nombre as articulo,
  CASE 
    WHEN m.tipo = 'entrada' THEN e.tipo
    WHEN m.tipo = 'salida' THEN s.tipo
  END as tipo_especifico,
  CASE 
    WHEN m.tipo = 'entrada' THEN e.proveedor
    WHEN m.tipo = 'salida' THEN s.motivo_salida
  END as detalle
FROM movimiento m
LEFT JOIN articulo a ON m.articulo_id = a.cod
LEFT JOIN entrada e ON m.id = e.movimiento_id
LEFT JOIN salida s ON m.id = s.movimiento_id
ORDER BY m.fecha DESC;

-- ============================================================
-- HISTORIAL DE COMBUSTIBLE POR VEHÍCULO
-- ============================================================
SELECT 
  v.nombre,
  cc.fecha_carga,
  cc.km_actual,
  cc.cant_combustible_despachado,
  cc.despachante,
  ROUND(cc.cant_combustible_despachado / 
    NULLIF((cc.km_actual - LAG(cc.km_actual) OVER (PARTITION BY cc.id_vehiculo ORDER BY cc.fecha_carga)), 0) * 100, 2) 
    as consumo_x_100km
FROM combustible_carga cc
JOIN vehiculo v ON cc.id_vehiculo = v.id_vehiculo
ORDER BY cc.id_vehiculo, cc.fecha_carga;

-- ============================================================
-- VEHÍCULOS EN REVISIÓN
-- ============================================================
SELECT 
  v.id_vehiculo,
  v.nombre,
  v.marca,
  v.modelo,
  su.fecha_desde,
  su.fecha_hasta,
  DATEDIFF(day, su.fecha_desde, su.fecha_hasta) as dias_en_revision
FROM vehiculo v
JOIN status_update su ON v.id_vehiculo = su.id_vehiculo
WHERE su.tipo = 'en_revision'
ORDER BY su.fecha_desde DESC;

-- ============================================================
-- RECORDATORIOS PRÓXIMOS (Próximos 30 días)
-- ============================================================
SELECT 
  r.fecha,
  r.descripcion,
  v.nombre as vehiculo,
  DATEDIFF(day, CURRENT_DATE, r.fecha) as dias_restantes
FROM recordatorio r
JOIN vehiculo v ON r.id_vehiculo = v.id_vehiculo
WHERE r.fecha BETWEEN CURRENT_DATE AND DATEADD(day, 30, CURRENT_DATE)
ORDER BY r.fecha ASC;

-- ============================================================
-- ESTADÍSTICAS DEL ALMACÉN
-- ============================================================
SELECT 
  'Total Artículos' as metrica,
  COUNT(*) as cantidad
FROM articulo
UNION ALL
SELECT 
  'Grupos de Artículos' as metrica,
  COUNT(*) as cantidad
FROM grupo_articulo
UNION ALL
SELECT 
  'Total Movimientos' as metrica,
  COUNT(*) as cantidad
FROM movimiento
UNION ALL
SELECT 
  'Entradas' as metrica,
  COUNT(*) as cantidad
FROM entrada
UNION ALL
SELECT 
  'Salidas' as metrica,
  COUNT(*) as cantidad
FROM salida;

-- ============================================================
-- ESTADÍSTICAS DE VEHÍCULOS
-- ============================================================
SELECT 
  'Total Vehículos' as metrica,
  COUNT(*) as cantidad
FROM vehiculo
UNION ALL
SELECT 
  'Vehículos Activos' as metrica,
  COUNT(*) as cantidad
FROM vehiculo
WHERE status = 'activo'
UNION ALL
SELECT 
  'Vehículos en Revisión' as metrica,
  COUNT(*) as cantidad
FROM vehiculo
WHERE status = 'en_revision'
UNION ALL
SELECT 
  'Total Cargas de Combustible' as metrica,
  COUNT(*) as cantidad
FROM combustible_carga;

-- ============================================================
-- ARTÍCULOS POR SECTOR DEL GALPON
-- ============================================================
SELECT 
  sg.descripcion as sector,
  COUNT(a.cod) as cantidad_articulos,
  g.nombre as grupo
FROM sector_galpon sg
LEFT JOIN grupo_articulo g ON sg.id = g.ubicacion
LEFT JOIN articulo a ON g.id = a.grupo_id
GROUP BY sg.id, sg.descripcion, g.nombre
ORDER BY sg.id;

-- ============================================================
-- CONSUMO PROMEDIO DE COMBUSTIBLE POR MARCA
-- ============================================================
SELECT 
  v.marca,
  COUNT(cc.id_carga) as total_cargas,
  ROUND(AVG(cc.cant_combustible_despachado), 2) as consumo_promedio,
  ROUND(SUM(cc.cant_combustible_despachado), 2) as consumo_total,
  ROUND(AVG(v.uso_combustible), 2) as uso_teorico
FROM vehiculo v
LEFT JOIN combustible_carga cc ON v.id_vehiculo = cc.id_vehiculo
GROUP BY v.marca
ORDER BY consumo_promedio DESC;

-- ============================================================
-- VERIFICAR INTEGRIDAD DE DATOS
-- ============================================================
-- Buscar orfandades (registros sin padre)
SELECT 'Info Adicional sin Vehículo' as problema, COUNT(*) as cantidad
FROM info_adicional
WHERE id_vehiculo NOT IN (SELECT id_vehiculo FROM vehiculo)
UNION ALL
SELECT 'Combustible Carga sin Vehículo', COUNT(*)
FROM combustible_carga
WHERE id_vehiculo NOT IN (SELECT id_vehiculo FROM vehiculo)
UNION ALL
SELECT 'Status Update sin Vehículo', COUNT(*)
FROM status_update
WHERE id_vehiculo NOT IN (SELECT id_vehiculo FROM vehiculo)
UNION ALL
SELECT 'Recordatorio sin Vehículo', COUNT(*)
FROM recordatorio
WHERE id_vehiculo NOT IN (SELECT id_vehiculo FROM vehiculo)
UNION ALL
SELECT 'Artículo sin Grupo', COUNT(*)
FROM articulo
WHERE grupo_id NOT IN (SELECT id FROM grupo_articulo)
UNION ALL
SELECT 'Movimiento sin Artículo', COUNT(*)
FROM movimiento
WHERE articulo_id NOT IN (SELECT cod FROM articulo);

-- ============================================================
-- LIMPIAR DATOS (USAR CON CUIDADO)
-- ============================================================
-- DELETE FROM recordatorio;
-- DELETE FROM status_update;
-- DELETE FROM combustible_carga;
-- DELETE FROM salida;
-- DELETE FROM entrada;
-- DELETE FROM movimiento;
-- DELETE FROM info_adicional;
-- DELETE FROM vehiculo;
-- DELETE FROM articulo;
-- DELETE FROM grupo_articulo;
-- DELETE FROM unidad_medida_cuant;
-- DELETE FROM sector_galpon;
-- DELETE FROM sector;
