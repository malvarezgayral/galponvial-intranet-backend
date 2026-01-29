# Guía de Migración - Sistema de Permisos Granulares

## Pre-Requisitos

- Base de datos PostgreSQL actualizada
- Backup de la base de datos actual
- Código actualizado con los cambios

## Paso 1: Backup de la Base de Datos

```bash
# Crear backup
pg_dump -U postgres galpon_vial_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_*.sql
```

## Paso 2: Migración de Esquema

### 2.1 Agregar Columna `tipo` a `sector_galpon`

```sql
-- Conectarse a la base de datos
psql -U postgres -d galpon_vial_db

-- Agregar la columna
ALTER TABLE sector_galpon 
ADD COLUMN tipo VARCHAR(20) DEFAULT 'almacen-comun';

-- Verificar cambio
\d sector_galpon;
```

### 2.2 Cambiar Restricción a NOT NULL y Tipo ENUM

```sql
-- Crear el enum type
CREATE TYPE sector_tipo_enum AS ENUM ('almacen-taller', 'almacen-comun');

-- Alterar la columna a ENUM
ALTER TABLE sector_galpon 
ALTER COLUMN tipo TYPE sector_tipo_enum USING tipo::sector_tipo_enum;

-- Hacer obligatorio
ALTER TABLE sector_galpon 
ALTER COLUMN tipo SET NOT NULL;

-- Verificar
SELECT * FROM sector_galpon;
```

### 2.3 Actualizar Datos Existentes

Según el CSV de `sectores_galpon.csv`:

```sql
-- Almacenes taller
UPDATE sector_galpon SET tipo = 'almacen-taller' WHERE nro_sector IN (1, 4);

-- Almacenes comunes
UPDATE sector_galpon SET tipo = 'almacen-comun' WHERE nro_sector IN (2, 3, 5);

-- Verificar
SELECT id, nro_sector, tipo FROM sector_galpon ORDER BY id;
```

**Salida esperada**:
```
 id | nro_sector |      tipo
----+------------+-----------------
  1 |          1 | almacen-taller
  2 |          2 | almacen-comun
  3 |          3 | almacen-comun
  4 |          4 | almacen-taller
  5 |          5 | almacen-comun
```

## Paso 3: Actualizar Tabla `rol`

### 3.1 Revisar Estructura Actual

```sql
SELECT * FROM rol;
```

**Estructura esperada**:
```
 id | rol       | permisos
----+-----------+---------------------------
  1 | user      | {almacen-taller:read}
  2 | user      | {almacen-comun:read}
  3 | superuser | {almacen-taller:read}
  4 | superuser | {almacen-taller:write}
  ...
```

### 3.2 Recarga de Datos con Seed

Si usar TypeORM migrations:

```bash
# Limpiar tabla de roles (CUIDADO: guarda backup primero)
npm run seed:roles

# O ejecutar manualmente
npm run seed
```

## Paso 4: Verificar Integridad de Datos

```sql
-- 1. Verificar que todos los grupos tienen sectores
SELECT g.id, g.nombre, sg.id as sector_id, sg.tipo
FROM grupo_articulo g
LEFT JOIN sector_galpon sg ON g.ubicacion = sg.id
WHERE sg.id IS NULL;

-- Resultado esperado: 0 filas (sin huérfanos)

-- 2. Verificar que todos los artículos tienen grupos
SELECT COUNT(*) as articulos_sin_grupo
FROM articulo a
WHERE a.grupo_id IS NULL;

-- Resultado esperado: 0

-- 3. Verificar distribución de artículos por sector
SELECT sg.tipo, COUNT(a.cod) as cantidad
FROM articulo a
JOIN grupo_articulo g ON a.grupo_id = g.id
JOIN sector_galpon sg ON g.ubicacion = sg.id
GROUP BY sg.tipo;

-- Resultado esperado:
-- almacen-taller | X
-- almacen-comun  | Y
```

## Paso 5: Validar Permisos

```sql
-- Verificar roles y sus permisos
SELECT r.id, r.rol, string_agg(p, ', ') as permisos
FROM rol r, unnest(r.permisos) as p
GROUP BY r.id, r.rol
ORDER BY r.rol, r.id;

-- Resultado esperado:
-- id |    rol    |          permisos
-- ---+-----------+-----------------------------
--  1 | admin     | all:read
-- 12 | admin     | all:write
-- 13 | admin     | almacen-comun:read
-- 14 | admin     | almacen-comun:write
-- 11 | admin     | almacen-taller:read
-- 12 | admin     | almacen-taller:write
```

## Paso 6: Validar Usuarios

```sql
-- Verificar usuarios con roles válidos
SELECT u.dni, u.nombre, r.rol, r.permisos
FROM usuario u
LEFT JOIN rol r ON u.rol_id = r.id
WHERE u.isActive = true
ORDER BY u.nombre;

-- Buscar usuarios sin rol
SELECT dni, nombre FROM usuario WHERE rol_id IS NULL;
```

## Paso 7: Actualizar Aplicación

```bash
# 1. Pull del código actualizado
git pull origin main

# 2. Instalar dependencias (si hay cambios)
npm install

# 3. Compilar
npm run build

# 4. Ejecutar tests
npm run test

# 5. Ejecutar tests E2E
npm run test:e2e

# 6. Iniciar en modo desarrollo
npm run start:dev

# O en producción
npm run start:prod
```

## Paso 8: Validar Endpoints

### 8.1 Test de Autenticación

```bash
# Obtener token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"password123"}'

# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 8.2 Test de Endpoints Protegidos

```bash
# Obtener artículos (requiere auth pero no permisos específicos)
curl -X GET http://localhost:3000/almacen/articulos \
  -H "Authorization: Bearer $TOKEN"

# Crear artículo (requiere permisos específicos)
curl -X POST http://localhost:3000/almacen/articulos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Test",
    "modelo":"T1",
    "descripcion":"Test",
    "grupo_id":1,
    "unidad_tipo":"pieza",
    "stock":5
  }'

# Respuestas esperadas:
# - 201 Created: Usuario tiene permisos
# - 403 Forbidden: Usuario no tiene permisos
# - 401 Unauthorized: Token inválido/expirado
```

## Paso 9: Monitoreo y Validación

### 9.1 Logs de Aplicación

```bash
# Verificar logs
tail -f logs/error.log
tail -f logs/info.log
```

### 9.2 Métricas

```bash
# Número de operaciones bloqueadas por permisos
SELECT COUNT(*) FROM audit_log WHERE action = 'PERMISSION_DENIED';

# Usuarios activos por rol
SELECT r.rol, COUNT(DISTINCT u.dni) as usuarios
FROM usuario u
JOIN rol r ON u.rol_id = r.id
WHERE u.isActive = true
GROUP BY r.rol;
```

## Rollback (Si es Necesario)

```bash
# 1. Detener la aplicación
docker stop galpon-vial

# 2. Restaurar base de datos
psql -U postgres -d galpon_vial_db < backup_YYYYMMDD_HHMMSS.sql

# 3. Restaurar código anterior
git checkout previous-version

# 4. Reiniciar
docker start galpon-vial
```

## Checklist de Migración

- [ ] Backup realizado y validado
- [ ] Columna `tipo` agregada a `sector_galpon`
- [ ] Enum type creado
- [ ] Datos migrados correctamente
- [ ] Integridad referencial validada
- [ ] Permisos actualizados en tabla `rol`
- [ ] Usuarios tienen roles válidos
- [ ] Código actualizado y compilado
- [ ] Tests pasados
- [ ] Endpoints validados
- [ ] Logs monitoreados
- [ ] Usuarios notificados del cambio

## Documentación para Usuarios

### Cambios Visibles
1. Los usuarios ahora solo ven/pueden editar artículos según sus permisos
2. Mensajes de error más descriptivos en permisos insuficientes
3. Interfaz filtra automáticamente según acceso

### Usuarios Afectados
- Almaceneros: Ahora limitados a su área específica
- Supervisores: Pueden ver/editar en múltiples áreas
- Admins: Acceso total sin cambios

## Soporte

Para preguntas o problemas:
1. Revisar `CAMBIOS_PERMISOS_ARTICULOS.md`
2. Revisar `GUIA_USO_PERMISOS.md`
3. Revisar logs de la aplicación
4. Contactar al equipo de desarrollo
