-- ============================================================
-- SCRIPT SQL PARA CREAR TABLAS DEL MÓDULO VEHÍCULOS
-- ============================================================

-- ============================================================
-- TABLA: sector
-- Descripción: Sectores de la empresa
-- ============================================================
CREATE TABLE IF NOT EXISTS sector (
  id_sector SERIAL PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: vehiculo
-- Descripción: Información principal de vehículos
-- ============================================================
CREATE TABLE IF NOT EXISTS vehiculo (
  id_vehiculo SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(255) NOT NULL,
  modelo VARCHAR(255) NOT NULL,
  anio DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('activo', 'en_revision', 'inactivo')),
  uso_combustible FLOAT NOT NULL,
  uso_km FLOAT NOT NULL,
  tipo_vehiculo VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: info_adicional
-- Descripción: Información adicional de vehículos
-- ============================================================
CREATE TABLE IF NOT EXISTS info_adicional (
  id_info_adicional SERIAL PRIMARY KEY,
  numero_serie BIGINT NOT NULL UNIQUE,
  licencia_conductor VARCHAR(255) NOT NULL,
  color VARCHAR(10) NOT NULL,
  seguro_empresa VARCHAR(255) NOT NULL,
  poliza VARCHAR(255) NOT NULL,
  id_sector_pertenencia INT NOT NULL,
  id_vehiculo INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_info_sector FOREIGN KEY (id_sector_pertenencia) REFERENCES sector(id_sector) ON DELETE RESTRICT,
  CONSTRAINT fk_info_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: combustible_carga
-- Descripción: Registro de carga de combustible
-- ============================================================
CREATE TABLE IF NOT EXISTS combustible_carga (
  id_carga SERIAL PRIMARY KEY,
  fecha_carga DATE NOT NULL,
  despachante VARCHAR(255),
  km_actual FLOAT NOT NULL,
  cant_combustible_despachado FLOAT NOT NULL,
  id_vehiculo INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carga_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: status_update
-- Descripción: Historial de cambios de estado de vehículos
-- ============================================================
CREATE TABLE IF NOT EXISTS status_update (
  id_status SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('activo', 'en_revision', 'inactivo')),
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE NOT NULL,
  id_vehiculo INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: recordatorio
-- Descripción: Recordatorios de mantenimiento para vehículos
-- ============================================================
CREATE TABLE IF NOT EXISTS recordatorio (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  id_vehiculo INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recordatorio_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE
);

-- ============================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vehiculo_status ON vehiculo(status);
CREATE INDEX IF NOT EXISTS idx_vehiculo_marca ON vehiculo(marca);
CREATE INDEX IF NOT EXISTS idx_combustible_fecha ON combustible_carga(fecha_carga);
CREATE INDEX IF NOT EXISTS idx_status_update_fecha ON status_update(fecha_desde);
CREATE INDEX IF NOT EXISTS idx_recordatorio_fecha ON recordatorio(fecha);
