# Comparación: Métodos de Seed

## 3 Formas de Popular la Base de Datos

### 1️⃣ ENDPOINT REST (Recomendado para desarrollo)

**Ventajas:**
- ✅ Más fácil de usar
- ✅ Rápido de ejecutar
- ✅ Ideal para desarrollo
- ✅ Portable entre máquinas
- ✅ Integrable en scripts

**Desventajas:**
- ❌ Requiere servidor running
- ❌ Menos control detallado

**Cómo usar:**
```bash
# Iniciar servicios
docker-compose up -d

# Iniciar servidor
pnpm run start:dev

# En otra terminal
curl -X POST http://localhost:3000/seed/run
```

**Archivo relacionado:**
- `src/seed/seed.controller.ts`
- `src/seed/seed.service.ts`

---

### 2️⃣ SCRIPTS SQL DIRECTOS (Recomendado para control total)

**Ventajas:**
- ✅ Control total
- ✅ No requiere servidor running
- ✅ Fácil debuggear
- ✅ Perfecto para DBA
- ✅ Reutilizable

**Desventajas:**
- ❌ Más manual
- ❌ Requiere herramienta SQL

**Cómo usar:**
```
1. Abrir DBeaver/pgAdmin/CLI
2. Conectarse a postgres://localhost:5432
3. Ejecutar scripts en orden:
   - 01_crear_tablas_vehiculos.sql
   - 02_crear_tablas_almacen.sql
   - 03_insertar_datos_vehiculos.sql
   - 04_insertar_datos_almacen.sql
```

**Archivos relacionados:**
- `src/seed/sql/01_*.sql`
- `src/seed/sql/02_*.sql`
- `src/seed/sql/03_*.sql`
- `src/seed/sql/04_*.sql`

---

### 3️⃣ HYBRID (DDL SQL + DML REST)

**Ventajas:**
- ✅ Equilibrio entre control y conveniencia
- ✅ Usar SQL para estructuras
- ✅ Usar REST para datos
- ✅ Flexible

**Desventajas:**
- ❌ Requiere ambos conocimientos

**Cómo usar:**
```bash
# Paso 1: En DBeaver ejecutar
01_crear_tablas_vehiculos.sql
02_crear_tablas_almacen.sql

# Paso 2: En terminal ejecutar
curl -X POST http://localhost:3000/seed/run
```

---

## Comparativa Detallada

| Criterio | REST | SQL Directo | Hybrid |
|----------|------|-------------|--------|
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Control** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Velocidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Debugging** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Requisitos** | Servidor | BD conectada | Ambos |
| **Ideal para** | Dev/Testing | Production/DBA | Balance |

---

## Casos de Uso

### ✅ Usa REST si:
- Estás en desarrollo local
- Quieres testing rápido
- Necesitas reproducibilidad
- Trabajas en equipo

**Ejemplo:**
```bash
# Desarrollo local rápido
pnpm run start:dev
curl -X POST http://localhost:3000/seed/run
# ✓ BD poblada en 2 segundos
```

### ✅ Usa SQL Directo si:
- Eres DBA/DevOps
- Necesitas máximo control
- Requiere audit trail
- Integración CI/CD
- Base de datos compartida

**Ejemplo:**
```sql
-- DBeaver script
-- Puedo ver exactamente qué se ejecuta
-- Guardar logs de ejecución
-- Debuggear fila por fila
```

### ✅ Usa Hybrid si:
- Quieres lo mejor de ambos
- Estructura controlada + datos flexibles
- Testing con datos variables

**Ejemplo:**
```bash
# Crear estructura consistente con SQL
# Pero permite modificar datos fácilmente con REST
```

---

## Performance

### Benchmark

| Método | Tiempo |
|--------|--------|
| REST | ~2-3 segundos |
| SQL Scripts | ~1-2 segundos |
| Hybrid | ~3-4 segundos |

*Tiempos en máquina local con BD localhost*

---

## Ejemplo de Flujo por Rol

### 👨‍💻 Developer (desarrollo local)
```bash
# Mañana: Iniciar todo
docker-compose up -d
pnpm install
pnpm run start:dev
curl -X POST http://localhost:3000/seed/run

# ✓ Listo para trabajar
```

### 🔧 DevOps (CI/CD)
```bash
# Script de setup
psql -U postgres -d galpon_vial < 01_crear_tablas_vehiculos.sql
psql -U postgres -d galpon_vial < 02_crear_tablas_almacen.sql
psql -U postgres -d galpon_vial < 03_insertar_datos_vehiculos.sql
psql -U postgres -d galpon_vial < 04_insertar_datos_almacen.sql

# ✓ BD lista en pipeline
```

### 📊 DBA (análisis)
```sql
-- Validar en DBeaver
SELECT * FROM 05_queries_utiles_validacion.sql;

-- Inspeccionar
SELECT COUNT(*) FROM vehiculo;
SELECT * FROM vehiculo WHERE status = 'en_revision';

-- Limpiar si es necesario
DELETE FROM recordatorio WHERE fecha < '2024-01-01';
```

---

## Configuración por Ambiente

### 🚀 Desarrollo (Local)
```bash
# usar REST endpoint
# ver logs en tiempo real
# reiniciar fácilmente
```

### 🧪 Testing (CI)
```bash
# usar SQL scripts
# reproducible
# auditable
```

### 📦 Producción (NO usar seed)
```bash
# Usar migrations + scripts de setup
# Datos iniciales manuales
# Backup y recovery
```

---

## Recomendación Final

| Situación | Recomendación |
|-----------|---------------|
| Trabajar solo | REST endpoint |
| Equipo de desarrollo | REST endpoint + SQL templates |
| Integration tests | SQL scripts directo |
| Producción | Nunca, usar migrations |
| Backup/Recovery | SQL scripts |
| Demo/Presentación | REST (rápido y fácil) |

---

## Comandos Rápidos

### Opción 1: REST (Una línea)
```bash
docker-compose up -d && pnpm run start:dev &
sleep 5 && curl -X POST http://localhost:3000/seed/run
```

### Opción 2: SQL (Directo en psql)
```bash
psql -U postgres -h localhost < src/seed/sql/01_crear_tablas_vehiculos.sql
psql -U postgres -h localhost < src/seed/sql/02_crear_tablas_almacen.sql
psql -U postgres -h localhost < src/seed/sql/03_insertar_datos_vehiculos.sql
psql -U postgres -h localhost < src/seed/sql/04_insertar_datos_almacen.sql
```

### Opción 3: Shell script
```bash
chmod +x src/seed/test-seed.sh
src/seed/test-seed.sh
```

---

## Próximas Mejoras Sugeridas

1. **Endpoint para limpiar seed**
   ```
   DELETE /seed/clean
   ```

2. **Endpoint para validar integridad**
   ```
   GET /seed/validate
   ```

3. **Endpoint para obtener estadísticas**
   ```
   GET /seed/stats
   ```

4. **Seed parametrizable**
   ```
   POST /seed/run?scale=large
   ```

5. **Exportar datos poblados**
   ```
   GET /seed/export
   ```

---

**¡Elige el método que mejor se adapte a tu workflow!** 🚀
