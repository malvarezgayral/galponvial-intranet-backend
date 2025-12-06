-- ============================================================
-- SCRIPT SQL PARA POPULAR DATOS INICIALES - VEHÍCULOS
-- ============================================================

-- ============================================================
-- INSERTAR SECTORES
-- ============================================================
INSERT INTO sector (id_sector, nombre) VALUES
(1, 'Operaciones'),
(2, 'Mantenimiento'),
(3, 'Logística'),
(4, 'Administrativo'),
(5, 'Almacén Central')
ON CONFLICT (id_sector) DO NOTHING;

-- ============================================================
-- INSERTAR VEHÍCULOS
-- ============================================================
INSERT INTO vehiculo (id_vehiculo, nombre, marca, modelo, anio, status, uso_combustible, uso_km, tipo_vehiculo) VALUES
(1, 'Camión Volvo 1', 'Volvo', 'FH16', '2018-01-01'::DATE, 'activo', 25.5, 0.25, 'camión'),
(2, 'Camión Mercedes 1', 'Mercedes', 'Actros', '2019-01-01'::DATE, 'activo', 24.0, 0.28, 'camión'),
(3, 'Camión Scania 1', 'Scania', 'R440', '2017-01-01'::DATE, 'en_revision', 26.0, 0.24, 'camión'),
(4, 'Camioneta Ford 1', 'Ford', 'F-4000', '2016-01-01'::DATE, 'activo', 15.0, 0.50, 'camioneta'),
(5, 'Camioneta Chevrolet 1', 'Chevrolet', 'D-Max', '2020-01-01'::DATE, 'activo', 18.0, 0.48, 'camioneta')
ON CONFLICT (id_vehiculo) DO NOTHING;

-- ============================================================
-- INSERTAR INFORMACIÓN ADICIONAL DE VEHÍCULOS
-- ============================================================
INSERT INTO info_adicional (id_info_adicional, numero_serie, licencia_conductor, color, seguro_empresa, poliza, id_sector_pertenencia, id_vehiculo) VALUES
(1, 123456789012345, 'LC001', 'Blanco', 'Seguros del Este', 'POL-2024-001', 1, 1),
(2, 234567890123456, 'LC002', 'Rojo', 'Seguros del Este', 'POL-2024-002', 1, 2),
(3, 345678901234567, 'LC003', 'Azul', 'Seguros del Este', 'POL-2024-003', 2, 3),
(4, 456789012345678, 'LC004', 'Blanco', 'Seguros Sudamérica', 'POL-2024-004', 3, 4),
(5, 567890123456789, 'LC005', 'Negro', 'Seguros Sudamérica', 'POL-2024-005', 3, 5)
ON CONFLICT (id_info_adicional) DO NOTHING;

-- ============================================================
-- INSERTAR CARGAS DE COMBUSTIBLE
-- ============================================================
INSERT INTO combustible_carga (id_carga, fecha_carga, despachante, km_actual, cant_combustible_despachado, id_vehiculo) VALUES
(1, '2024-01-10'::DATE, 'Juan Pérez', 125000, 150.0, 1),
(2, '2024-01-12'::DATE, 'Maria García', 85000, 120.0, 2),
(3, '2024-01-14'::DATE, 'Carlos López', 245000, 180.0, 3),
(4, '2024-01-18'::DATE, 'Ana Martínez', 65000, 80.0, 4),
(5, '2024-01-20'::DATE, 'Roberto Díaz', 110000, 95.0, 5)
ON CONFLICT (id_carga) DO NOTHING;

-- ============================================================
-- INSERTAR ACTUALIZACIONES DE ESTADO
-- ============================================================
INSERT INTO status_update (id_status, tipo, fecha_desde, fecha_hasta, id_vehiculo) VALUES
(1, 'activo', '2024-01-01'::DATE, '2024-12-31'::DATE, 1),
(2, 'activo', '2024-01-01'::DATE, '2024-12-31'::DATE, 2),
(3, 'en_revision', '2024-01-15'::DATE, '2024-01-25'::DATE, 3),
(4, 'activo', '2024-01-01'::DATE, '2024-12-31'::DATE, 4),
(5, 'activo', '2024-01-01'::DATE, '2024-12-31'::DATE, 5)
ON CONFLICT (id_status) DO NOTHING;

-- ============================================================
-- INSERTAR RECORDATORIOS
-- ============================================================
INSERT INTO recordatorio (id, fecha, descripcion, id_vehiculo) VALUES
(1, '2024-02-15'::DATE, 'Revisar presión de llantas', 1),
(2, '2024-02-20'::DATE, 'Cambio de aceite', 1),
(3, '2024-02-15'::DATE, 'Inspección de frenos', 2),
(4, '2024-02-25'::DATE, 'Revisión general', 3),
(5, '2024-02-10'::DATE, 'Limpiar inyectores', 4),
(6, '2024-02-18'::DATE, 'Cambio de filtro de aire', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RESUMEN DE INSERCIONES
-- ============================================================
SELECT 
  (SELECT COUNT(*) FROM sector) as sectores,
  (SELECT COUNT(*) FROM vehiculo) as vehiculos,
  (SELECT COUNT(*) FROM info_adicional) as info_adicional,
  (SELECT COUNT(*) FROM combustible_carga) as cargas_combustible,
  (SELECT COUNT(*) FROM status_update) as estados,
  (SELECT COUNT(*) FROM recordatorio) as recordatorios;
