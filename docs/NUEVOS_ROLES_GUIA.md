# Nuevos Roles y Combinaciones - Guía de Implementación

## Solicitud Original
El usuario solicitó:
1. **Rol superadmin** con permisos `all:read` y `all:write` en un solo rol
2. **Roles superuser** específicos:
   - `almacen-comun:all` (read + write)
   - `almacen-taller:all` (read + write)
3. **Roles admin** específicos:
   - `almacen-comun:all` (read + write)
   - `almacen-taller:all` (read + write)
   - `all:all` (read + write)

## Solución Implementada: N:N Approach

Con la relación Many-to-Many implementada, **no necesitamos crear nuevos roles adicionales**. En su lugar, simplemente asignamos **múltiples roles existentes** a los usuarios.

### Opción A: Crear Roles Específicos (Recomendado para simplicidad)

Si prefieres mantener la lógica simple sin muchas asignaciones, puedes agregar estos nuevos roles:

#### Nuevos Roles a Agregar

```sql
-- Superadmin con acceso total
INSERT INTO rol (rol, permisos) VALUES (
  'superadmin',
  ARRAY['all:read', 'all:write']::text[]
);

-- Superuser Almacén Común (Total)
INSERT INTO rol (rol, permisos) VALUES (
  'superuser',
  ARRAY['almacen-comun:read', 'almacen-comun:write']::text[]
);

-- Superuser Almacén Taller (Total)
INSERT INTO rol (rol, permisos) VALUES (
  'superuser',
  ARRAY['almacen-taller:read', 'almacen-taller:write']::text[]
);

-- Admin Almacén Común (Total)
INSERT INTO rol (rol, permisos) VALUES (
  'admin',
  ARRAY['almacen-comun:read', 'almacen-comun:write']::text[]
);

-- Admin Almacén Taller (Total)
INSERT INTO rol (rol, permisos) VALUES (
  'admin',
  ARRAY['almacen-taller:read', 'almacen-taller:write']::text[]
);

-- Admin Total
INSERT INTO rol (rol, permisos) VALUES (
  'admin',
  ARRAY['all:read', 'all:write']::text[]
);
```

#### Actualizar Archivo CSV

Actualiza `src/seed/data/roles.csv`:

```csv
id,rol,permisos
1,user,almacen-taller:read
2,user,almacen-comun:read
3,superuser,almacen-taller:read
4,superuser,almacen-taller:write
5,superuser,almacen-comun:read
6,superuser,almacen-comun:write
7,admin,almacen-taller:read
8,admin,almacen-taller:write
9,admin,almacen-comun:read
10,admin,almacen-comun:write
11,admin,all:read
12,admin,all:write
13,superadmin,all:read
14,superadmin,all:write
15,superuser,almacen-comun:read
16,superuser,almacen-comun:write
17,superuser,almacen-taller:read
18,superuser,almacen-taller:write
19,admin,almacen-comun:read
20,admin,almacen-comun:write
21,admin,almacen-taller:read
22,admin,almacen-taller:write
```

### Opción B: Usar Múltiples Roles (Más Flexible)

Con N:N, puedes asignar **combinaciones de roles existentes**:

#### Ejemplo 1: Superadmin
```csv
-- usuario_rol.csv
dni,rol_id
99999999,11
99999999,12
```
*Usuario con dos roles: admin con `all:read` + admin con `all:write`*

Resultado: permisos combinados = `[all:read, all:write]`

#### Ejemplo 2: Superuser con Acceso Total a Almacén Común
```csv
dni,rol_id
88888888,5
88888888,6
```
*Usuario con: superuser `almacen-comun:read` + superuser `almacen-comun:write`*

Resultado: permisos combinados = `[almacen-comun:read, almacen-comun:write]`

#### Ejemplo 3: Superuser con Acceso Total a Almacén Taller
```csv
dni,rol_id
77777777,3
77777777,4
```
*Usuario con: superuser `almacen-taller:read` + superuser `almacen-taller:write`*

Resultado: permisos combinados = `[almacen-taller:read, almacen-taller:write]`

#### Ejemplo 4: Admin con Acceso Total
```csv
dni,rol_id
66666666,11
66666666,12
```
*Usuario con: admin `all:read` + admin `all:write`*

Resultado: permisos combinados = `[all:read, all:write]`

## Comparación de Enfoques

| Aspecto | Opción A (Nuevos Roles) | Opción B (Combinaciones) |
|--------|----------------------|----------------------|
| **Roles a Crear** | 6 nuevos | Usa los 12 existentes |
| **Complejidad BD** | Más filas en tabla `rol` | Más filas en tabla `usuario_rol` |
| **Flexibilidad** | Media (solo roles predefinidos) | Alta (cualquier combinación) |
| **Mantenimiento** | Fácil (cambios en una fila) | Requiere actualizar múltiples asignaciones |
| **Claridad** | Clara (rol específico por usuario) | Menos obvia (múltiples roles ocultos) |
| **Performance** | Ligeramente mejor | Idéntica con eager loading |

## Recomendación

**Opción A** es mejor si:
- Tienes usuarios con combinaciones fijas
- Prefieres lógica clara y simple
- Quieres evitar administrar múltiples asignaciones

**Opción B** es mejor si:
- Necesitas máxima flexibilidad
- Los requerimientos de permisos cambian frecuentemente
- Quieres reutilizar roles en muchas combinaciones

## Implementación Step-by-Step

### Paso 1: Decide qué opción usar

```typescript
// Si eliges Opción A: Ejecutar SQL INSERT para nuevos roles
// Si eliges Opción B: Solo actualizar usuario_rol.csv
```

### Paso 2: Verificar que los roles funcionan

```bash
# Consultar permisos de usuario
SELECT u.dni, u.nombre, r.rol, r.permisos
FROM usuario u
INNER JOIN usuario_rol ur ON u.dni = ur.dni
INNER JOIN rol r ON ur.rol_id = r.id
ORDER BY u.dni;
```

### Paso 3: Probar con curl

```bash
# Login con usuario superadmin
curl -X POST http://localhost:3000/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# El JWT debería contener permisos combinados
```

### Paso 4: Verificar artículos visibles

```bash
# Obtener artículos (debe retornar todos con all:read)
curl -X GET http://localhost:3000/almacen/articulos \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Estructura SQL Completa para Opción A

```sql
-- Agregar nuevos roles
INSERT INTO rol (id, rol, permisos) VALUES
(13, 'superadmin', ARRAY['all:read', 'all:write']::text[]),
(14, 'superuser', ARRAY['almacen-comun:read', 'almacen-comun:write']::text[]),
(15, 'superuser', ARRAY['almacen-taller:read', 'almacen-taller:write']::text[]),
(16, 'admin', ARRAY['almacen-comun:read', 'almacen-comun:write']::text[]),
(17, 'admin', ARRAY['almacen-taller:read', 'almacen-taller:write']::text[]),
(18, 'admin', ARRAY['all:read', 'all:write']::text[]);

-- Asignar a usuarios (ejemplo)
INSERT INTO usuario_rol (dni, rol_id) VALUES
(12345678, 13),  -- Juan es superadmin
(87654321, 14),  -- María es superuser almacén común
(11223344, 15),  -- Carlos es superuser almacén taller
(55667788, 16);  -- Ana es admin almacén común
```

## Estructura CSV para Opción B

```csv
# usuario_rol.csv
dni,rol_id
12345678,11
12345678,12
87654321,5
87654321,6
11223344,3
11223344,4
55667788,9
55667788,10
```

## Notas Importantes

1. **No cambiar ValidRoles enum** - `ValidRoles` sigue siendo `admin`, `superuser`, `user`
2. **Los permisos son lo que importa** - El sistema filtra por permisos, no por nombre del rol
3. **Combinaciones son Union** - Un usuario con 2 roles obtiene la UNIÓN de sus permisos
4. **Duplicación es OK** - Es valid tener múltiples roles con el mismo nombre (ej: múltiples `superuser`)

## Impacto en Código Existente

Con la implementación N:N actual, **no hay cambios necesarios en el código**:

```typescript
// ✅ Funciona como antes - combina automáticamente
const userRoles = user.roles;  // Array de roles
const permissions = userRoles.flatMap(r => r.permisos);  // Union de permisos

// Ejemplo:
user.roles = [
  { id: 3, rol: 'superuser', permisos: ['almacen-taller:read', 'almacen-taller:write'] },
  { id: 5, rol: 'superuser', permisos: ['almacen-comun:read', 'almacen-comun:write'] }
]

// permissions = ['almacen-taller:read', 'almacen-taller:write', 'almacen-comun:read', 'almacen-comun:write']
```

## Testing de Nuevos Roles

```typescript
// Test: Superuser con dos áreas
it('should allow superuser with both warehouse areas', async () => {
  const user = {
    roles: [
      { id: 3, rol: 'superuser', permisos: ['almacen-taller:read', 'almacen-taller:write'] },
      { id: 5, rol: 'superuser', permisos: ['almacen-comun:read', 'almacen-comun:write'] }
    ]
  };
  
  const combinedPermisos = user.roles.flatMap(r => r.permisos);
  expect(combinedPermisos).toContain('almacen-taller:write');
  expect(combinedPermisos).toContain('almacen-comun:write');
});
```

## Siguiente Paso: API para Administrar Roles

Considera crear endpoints para gestionar dinámicamente:

```typescript
// POST /usuario/:dni/roles
{
  "roleIds": [3, 5, 9]
}

// DELETE /usuario/:dni/roles/:rolId
// GET /usuario/:dni/roles
```

---

**Status**: ✅ Relación N:N implementada
**Siguiente**: Elegir Opción A o B y ejecutar
**Tiempo estimado**: 5-10 minutos para implementar

