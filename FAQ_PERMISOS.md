# FAQ - Sistema de Permisos Granulares de Almacén

## Preguntas Frecuentes

### 1. ¿Cómo sé qué permisos tiene un usuario?

**Respuesta:**
```sql
SELECT u.nombre, u.apellido, r.rol, r.permisos
FROM usuario u
JOIN rol r ON u.rol_id = r.id
WHERE u.dni = 12345678;
```

O en la interfaz de administración (si existe):
1. Ir a Usuarios
2. Buscar usuario
3. Ver "Rol" → "Permisos"

### 2. ¿Cómo cambio los permisos de un usuario?

**Respuesta:**
```sql
-- Cambiar rol (y sus permisos)
UPDATE usuario SET rol_id = 4 WHERE dni = 12345678;

-- Verificar cambio
SELECT rol_id FROM usuario WHERE dni = 12345678;
```

**Nota**: El nuevo rol debe existir en la tabla `rol`.

### 3. ¿Qué significa "almacen-taller:write"?

**Respuesta:**
- `almacen-taller`: El área (almacén de taller)
- `write`: Permiso de escritura (crear, editar, eliminar)
- **Significado**: Permiso para escribir artículos en el almacén de taller

Similar:
- `almacen-taller:read`: Solo ver artículos
- `almacen-comun:write`: Escribir en área común
- `all:write`: Escribir en cualquier área

### 4. ¿Un usuario puede tener múltiples roles?

**Respuesta Actual**: No, un usuario tiene UN rol.

**Alternativa de Futuro**: 
- Crear tabla intermedia usuario-rol (many-to-many)
- Permitir múltiples roles por usuario
- Evaluar permisos como unión de todos los roles

### 5. ¿Cómo crear un nuevo rol con permisos específicos?

**Respuesta:**
```sql
-- Ejemplo: Rol "jefe-taller" con permisos de lectura y escritura en taller

-- 1. Crear rol de lectura
INSERT INTO rol (rol, permisos) 
VALUES ('jefe-taller', ARRAY['almacen-taller:read']);

-- 2. Crear rol de escritura
INSERT INTO rol (rol, permisos) 
VALUES ('jefe-taller', ARRAY['almacen-taller:write']);

-- 3. Opcionalmente agregar más permisos
INSERT INTO rol (rol, permisos) 
VALUES ('jefe-taller', ARRAY['almacen-taller:read', 'almacen-taller:write']);

-- 4. Asignar a usuario
UPDATE usuario SET rol_id = (SELECT id FROM rol WHERE rol = 'jefe-taller' LIMIT 1)
WHERE dni = 12345678;
```

### 6. ¿Qué ocurre si intento editar un artículo sin permisos?

**Respuesta:**
Obtendrás un error HTTP 403:
```json
{
  "statusCode": 403,
  "message": "User Juan does not have required permissions: almacen-taller:write, almacen-comun:write, all:write",
  "error": "Forbidden"
}
```

### 7. ¿Los permisos de lectura (read) son obligatorios?

**Respuesta:**
- **Para escritura**: Sí, necesitas escribir para editar
- **Para lectura**: No es obligatorio en endpoints de lectura
- Un usuario sin permisos de lectura aún puede ver artículos si accede a GET /almacen/articulos

### 8. ¿Puedo ver artículos de un área sin permiso específico?

**Respuesta:**
Sí. Los endpoints GET no requieren permisos específicos de almacén:
```
GET /almacen/articulos → Solo requiere autenticación (JWT)
GET /almacen/grupos    → Solo requiere autenticación (JWT)
```

Solo los endpoints de escritura (POST, PUT, DELETE) requieren permisos específicos.

### 9. ¿Qué es el "Guard" AlmacenPermissionsGuard?

**Respuesta:**
Es un middleware (Guard en NestJS) que intercepta las solicitudes y valida:
1. ¿El usuario está autenticado? (JwtAuthGuard)
2. ¿El usuario tiene un rol válido? (UserValidRoleGuard)
3. ¿El usuario tiene los permisos requeridos? (AlmacenPermissionsGuard) ← NUEVO

```
Request → JwtAuthGuard → UserValidRoleGuard → AlmacenPermissionsGuard → Handler
```

### 10. ¿Cómo agregar un nuevo permiso?

**Respuesta:**

**Opción 1: Solo en código**
```typescript
// En src/usuario/enums/usuario.enum.ts
export enum Permisos {
  // ... permisos existentes
  NUEVO_PERMISO = 'nuevo-area:write',
}
```

**Opción 2: En base de datos (sin cambiar código)**
- Los permisos se almacenan como texto en la tabla `rol`
- Puedes insertar nuevos valores:
```sql
INSERT INTO rol (rol, permisos) 
VALUES ('custom-rol', ARRAY['nuevo-permiso:write']);
```

**Recomendación**: Agregar al enum para type-safety y documentación.

### 11. ¿Un artículo puede estar en dos áreas?

**Respuesta:**
No. Un artículo pertenece a un Grupo → Sector → Tipo.
Es una relación 1-a-1 en esa cadena.

**Si necesitas**:
- Duplica el artículo
- O crea un sistema más complejo (futuro)

### 12. ¿Qué pasa si elimino un sector?

**Respuesta:**
```
❌ ERROR: No puedes eliminar si hay grupos relacionados
  → Primero elimina/mueve los grupos
  → Luego elimina el sector
```

Esto es por integridad referencial (Foreign Key).

### 13. ¿Los permisos se cachean?

**Respuesta:**
No. Se validan en cada solicitud:
1. Se obtiene el usuario del token JWT
2. Se obtiene el rol del usuario
3. Se verifican los permisos
4. Se permite/rechaza

Si cambias permisos en BD, se aplican inmediatamente al siguiente request.

### 14. ¿Cómo resetear permisos a un estado anterior?

**Respuesta:**
```sql
-- Restaurar rol a su definición original
DELETE FROM rol WHERE id = 5;

-- Reinsertar desde CSV de backup
\COPY rol FROM 'roles_backup.csv' WITH (FORMAT csv, HEADER);
```

O si tienes backup de BD:
```bash
pg_restore -U postgres -d galpon_vial_db backup.sql
```

### 15. ¿Un admin necesita todos los permisos?

**Respuesta:**
Técnicamente no. Un admin con solo:
- `almacen-taller:write`

Podría:
- ✅ Crear/editar artículos en taller
- ❌ NO crear/editar en área común

Se recomienda que admins tengan:
```
almacen-taller:read
almacen-taller:write
almacen-comun:read
almacen-comun:write
all:read
all:write
```

### 16. ¿Hay un logs de quién cambió qué?

**Respuesta:**
No implementado aún. Para agregar auditoría:

```sql
-- Crear tabla de auditoría
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  usuario_dni BIGINT REFERENCES usuario(dni),
  accion VARCHAR(50),
  tabla VARCHAR(50),
  id_registro INT,
  datos_antiguos JSONB,
  datos_nuevos JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- O usar TypeORM Listeners
```

### 17. ¿Puedo combinar permisos de lectura y escritura?

**Respuesta:**
Sí, un rol puede tener:
```sql
INSERT INTO rol (rol, permisos)
VALUES (
  'operario-completo',
  ARRAY['almacen-taller:read', 'almacen-taller:write']
);
```

El GuardAlmacenPermissions verifica que al menos UNO de los requeridos coincida.

### 18. ¿Qué pasa en modo desarrollo sin auth?

**Respuesta:**
Si desactivas JwtAuthGuard para testing:
```typescript
// Desactivado en dev
if (process.env.NODE_ENV === 'development') {
  return true; // Permitir todo
}
```

Pero con las protecciones normales:
- Siempre se valida token
- Siempre se valida rol
- Siempre se valida permisos (en endpoints POST/PUT/DELETE)

### 19. ¿Los permisos heredan de padres (como roles)?

**Respuesta:**
No. Cada rol tiene su lista explícita de permisos.

**Futuro posible**:
```typescript
// No existe actualmente
class Role {
  permisos: Permisos[];
  parent?: Role;  // ← Heredar permisos del padre
}
```

### 20. ¿Cómo debuggear problemas de permisos?

**Respuesta:**
```typescript
// En tu código
console.log('User:', req.user);
console.log('Role:', req.user.rol);
console.log('Permisos:', req.user.rol.permisos);
```

**En logs**:
```bash
tail -f logs/error.log | grep AlmacenPermissions
```

**En BD**:
```sql
SELECT * FROM usuario u
JOIN rol r ON u.rol_id = r.id
WHERE u.dni = 12345678;
```

---

## Contacto y Soporte

Si tu pregunta no está aquí:
1. Revisar código en `/src/usuario/guards/almacen-permissions.guard.ts`
2. Revisar tests en `/src/almacen/almacen.controller.spec.ts`
3. Contactar al equipo de desarrollo
