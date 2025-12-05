-- ============================================================
-- SCRIPT SQL PARA POPULAR DATOS INICIALES - ALMACÉN
-- ============================================================

-- ============================================================
-- INSERTAR SECTORES DEL GALPON
-- ============================================================
INSERT INTO sector_galpon (id, nro_sector, descripcion) VALUES
(1, 1, 'Sector norte - Estanterías A-C'),
(2, 2, 'Sector centro - Estanterías D-F'),
(3, 3, 'Sector sur - Estanterías G-I'),
(4, 4, 'Depósito refrigerado'),
(5, 5, 'Área de embalaje')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSERTAR UNIDADES DE MEDIDA
-- ============================================================
INSERT INTO unidad_medida_cuant (id, tipo, cantidad) VALUES
(1, 'peso', 1.0),
(2, 'peso', 5.0),
(3, 'peso', 10.0),
(4, 'volumen', 1.0),
(5, 'volumen', 5.0),
(6, 'volumen', 10.0),
(7, 'distancia', 1.0),
(8, 'distancia', 10.0),
(9, 'distancia', 100.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSERTAR GRUPOS DE ARTÍCULOS
-- ============================================================
INSERT INTO grupo_articulo (id, nombre, descripcion, ubicacion) VALUES
(1, 'Repuestos', 'Repuestos y componentes para vehículos', 1),
(2, 'Neumaticos', 'Neumáticos y llantas', 2),
(3, 'Combustibles', 'Combustibles y lubricantes', 4),
(4, 'Herramientas', 'Herramientas y equipos', 3),
(5, 'Accesorios', 'Accesorios varios', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSERTAR ARTÍCULOS
-- ============================================================
INSERT INTO articulo (cod, nombre, modelo, descripcion, img_url, unidad_tipo, grupo_id, unidad_medida_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Filtro de aire', 'FA-100', 'Filtro de aire para motores diesel', 'https://example.com/filtro.jpg', 'pieza', 1, NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Pastillas de freno', 'PF-200', 'Pastillas de freno cerámicas', 'https://example.com/pastillas.jpg', 'caja', 1, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Neumático 11R22.5', 'NE-300', 'Neumático para camión', 'https://example.com/neumatico.jpg', 'pieza', 2, NULL),
('550e8400-e29b-41d4-a716-446655440004', 'Aceite diesel 15W40', 'AC-400', 'Aceite mineral para motores diesel', 'https://example.com/aceite.jpg', 'volumen', 3, 5),
('550e8400-e29b-41d4-a716-446655440005', 'Destornillador Phillips', 'HE-500', 'Destornillador de 10 pulgadas', 'https://example.com/destorn.jpg', 'pieza', 4, NULL),
('550e8400-e29b-41d4-a716-446655440006', 'Correa de distribución', 'CD-600', 'Correa de distribución reforzada', 'https://example.com/correa.jpg', 'pieza', 1, NULL),
('550e8400-e29b-41d4-a716-446655440007', 'Bujías', 'BU-700', 'Juego de 6 bujías', 'https://example.com/bujias.jpg', 'caja', 1, NULL),
('550e8400-e29b-41d4-a716-446655440008', 'Batería 12V', 'BA-800', 'Batería de arranque 12V 100Ah', 'https://example.com/bateria.jpg', 'pieza', 1, NULL)
ON CONFLICT (cod) DO NOTHING;

-- ============================================================
-- INSERTAR MOVIMIENTOS
-- ============================================================
INSERT INTO movimiento (id, tipo, fecha, articulo_id, usuario_id) VALUES
(1, 'entrada', '2024-01-15'::DATE, '550e8400-e29b-41d4-a716-446655440001', 1001),
(2, 'entrada', '2024-01-16'::DATE, '550e8400-e29b-41d4-a716-446655440002', 1002),
(3, 'entrada', '2024-01-17'::DATE, '550e8400-e29b-41d4-a716-446655440003', 1001),
(4, 'salida', '2024-01-20'::DATE, '550e8400-e29b-41d4-a716-446655440001', 1003),
(5, 'entrada', '2024-01-22'::DATE, '550e8400-e29b-41d4-a716-446655440004', 1002)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSERTAR ENTRADAS
-- ============================================================
INSERT INTO entrada (id, tipo, detalle, proveedor, movimiento_id) VALUES
(1, 'compra', 'Compra de filtros de aire', 'Filtros SA', 1),
(2, 'compra', 'Compra de pastillas de freno', 'Frenos Uruguay', 2),
(3, 'compra', 'Compra de neumáticos', 'Michelin', 3),
(4, 'inventario inicial', 'Stock inicial cargado', 'Sistema', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INSERTAR SALIDAS
-- ============================================================
INSERT INTO salida (id, tipo, detalle, motivo_salida, detalle_motivo, movimiento_id) VALUES
(1, 'consumo', 'Filtro usado en mantenimiento', 'Desgaste', 'Cambio programado', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RESUMEN DE INSERCIONES
-- ============================================================
SELECT 
  (SELECT COUNT(*) FROM sector_galpon) as sectores_galpon,
  (SELECT COUNT(*) FROM unidad_medida_cuant) as unidades_medida,
  (SELECT COUNT(*) FROM grupo_articulo) as grupos_articulo,
  (SELECT COUNT(*) FROM articulo) as articulos,
  (SELECT COUNT(*) FROM movimiento) as movimientos,
  (SELECT COUNT(*) FROM entrada) as entradas,
  (SELECT COUNT(*) FROM salida) as salidas;
