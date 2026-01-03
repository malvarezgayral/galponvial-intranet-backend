-- ============================================================
-- SCRIPT SQL PARA CREAR TABLAS DEL MÓDULO ALMACÉN
-- ============================================================

-- ============================================================
-- TABLA: sector_galpon
-- Descripción: Sectores dentro del galpon
-- ============================================================
CREATE TABLE IF NOT EXISTS sector_galpon (
  id SERIAL PRIMARY KEY,
  nro_sector INT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: unidad_medida_cuant
-- Descripción: Unidades de medida cuantitativa
-- ============================================================
CREATE TABLE IF NOT EXISTS unidad_medida_cuant (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('peso', 'volumen', 'distancia')),
  cantidad FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: grupo_articulo
-- Descripción: Agrupación de artículos
-- ============================================================
CREATE TABLE IF NOT EXISTS grupo_articulo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grupo_sector FOREIGN KEY (ubicacion) REFERENCES sector_galpon(id) ON DELETE RESTRICT
);

-- ============================================================
-- TABLA: articulo
-- Descripción: Artículos del inventario
-- ============================================================
CREATE TABLE IF NOT EXISTS articulo (
  cod SERIAL PRIMARY KEY,
  cod_proveedor VARCHAR(50),
  nombre VARCHAR(255) NOT NULL,
  modelo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  img_url TEXT,
  stock INT,
  unidad_tipo VARCHAR(50) NOT NULL CHECK (unidad_tipo IN ('pieza', 'caja', 'peso', 'volumen', 'distancia', 'paquete')),
  grupo_id INT NOT NULL,
  unidad_medida_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articulo_grupo FOREIGN KEY (grupo_id) REFERENCES grupo_articulo(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articulo_unidad FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida_cuant(id) ON DELETE SET NULL
);


-- ============================================================
-- TABLA: movimiento
-- Descripción: Movimientos de artículos (entrada/salida)
-- ============================================================
CREATE TABLE IF NOT EXISTS movimiento (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  fecha DATE NOT NULL,
  articulo_id INT NOT NULL,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimiento_articulo FOREIGN KEY (articulo_id) REFERENCES articulo(cod) ON DELETE RESTRICT
);

-- ============================================================
-- TABLA: entrada
-- Descripción: Detalles de entradas de artículos
-- ============================================================
CREATE TABLE IF NOT EXISTS entrada (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('compra', 'inventario inicial', 'cambio', 'traspaso', 'cambio de unidad', 'alquiler')),
  detalle TEXT NOT NULL,
  proveedor VARCHAR(20) NOT NULL,
  movimiento_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_entrada_movimiento FOREIGN KEY (movimiento_id) REFERENCES movimiento(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: salida
-- Descripción: Detalles de salidas de artículos
-- ============================================================
CREATE TABLE IF NOT EXISTS salida (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('rotura', 'perdida', 'consumo', 'robo', 'devolucion')),
  detalle TEXT,
  motivo_salida VARCHAR(30) NOT NULL,
  detalle_motivo TEXT,
  movimiento_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_salida_movimiento FOREIGN KEY (movimiento_id) REFERENCES movimiento(id) ON DELETE CASCADE
);

-- ============================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articulo_nombre ON articulo(nombre);
CREATE INDEX IF NOT EXISTS idx_articulo_grupo ON articulo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON movimiento(fecha);
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON movimiento(tipo);
CREATE INDEX IF NOT EXISTS idx_entrada_tipo ON entrada(tipo);
CREATE INDEX IF NOT EXISTS idx_salida_tipo ON salida(tipo);
CREATE INDEX IF NOT EXISTS idx_grupo_articulo_nombre ON grupo_articulo(nombre);
