# Corrección de Permisos de Lectura/Escritura en Endpoints

## 📋 Resumen de Cambios

Se corrigió la lógica de validación de permisos para asegurar que:

1. **Endpoints GET (lectura)**: Requieren explícitamente permisos de lectura
2. **Endpoints POST/PUT/DELETE (escritura)**: Requieren permisos de escritura
3. **Rechazo de acceso**: Si un usuario tiene solo permisos de escritura pero intenta hacer GET, será rechazado

---

## 🔧 Cambios Realizados

### 1. Decorador de Permisos de Lectura

**Archivo**: `src/usuario/decorators/almacen-permissions.decorator.ts`

```typescript
// NUEVO: Decorador para permisos de lectura
export function AlmacenReadPermissions(...permissions: Permisos[]) {
  return SetMetadata(ALMACEN_READ_PERMISSIONS_KEY, permissions);
}
```

### 2. Guard Mejorado

**Archivo**: `src/usuario/guards/almacen-permissions.guard.ts`

El guard ahora maneja:
- `requiredPermissions`: Para validar permisos de escritura
- `requiredReadPermissions`: Para validar permisos de lectura

Cada tipo de permiso se valida por separado, permitiendo mayor flexibilidad.

### 3. Controlador de Almacén

**Archivo**: `src/almacen/almacen.controller.ts`

#### GET /almacen/articulos (Lectura)
```typescript
@Get('articulos')
@Auth()
@UseGuards(AlmacenPermissionsGuard)
@AlmacenReadPermissions(
  Permisos.ALMACEN_TALLER_READ,
  Permisos.ALMACEN_COMUN_READ,
  Permisos.ALL_READ,
)
async getAllArticles(...) { ... }
```

#### GET /almacen/grupos (Lectura)
```typescript
@Get('grupos')
@Auth()
@UseGuards(AlmacenPermissionsGuard)
@AlmacenReadPermissions(
  Permisos.ALMACEN_TALLER_READ,
  Permisos.ALMACEN_COMUN_READ,
  Permisos.ALL_READ,
)
async getAllGroups() { ... }
```

#### GET /almacen/grupos/:id (Lectura)
```typescript
@Get('grupos/:id')
@Auth()
@UseGuards(AlmacenPermissionsGuard)
@AlmacenReadPermissions(
  Permisos.ALMACEN_TALLER_READ,
  Permisos.ALMACEN_COMUN_READ,
  Permisos.ALL_READ,
)
async getGroup(...) { ... }
```

#### GET /almacen/movimientos/:idArticulo (Lectura)
```typescript
@Get('movimientos/:idArticulo')
@Auth()
@UseGuards(AlmacenPermissionsGuard)
@AlmacenReadPermissions(
  Permisos.ALMACEN_TALLER_READ,
  Permisos.ALMACEN_COMUN_READ,
  Permisos.ALL_READ,
)
async getMovimientos(...) { ... }
```

#### POST /almacen/articulos (Escritura) - Sin cambios
```typescript
@Post('articulos')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseGuards(AlmacenPermissionsGuard)
@AlmacenPermissions(
  Permisos.ALMACEN_TALLER_WRITE,
  Permisos.ALMACEN_COMUN_WRITE,
  Permisos.ALL_WRITE,
)
async createArticle(...) { ... }
```

---

## 🧪 Casos de Prueba

### Caso 1: Usuario con solo permisos de LECTURA
```
Usuario: María García (87654321)
Rol: ADMIN_ALMACEN_COMUN
Permisos: [ALMACEN_COMUN_READ]

GET /almacen/articulos    ✅ PERMITIDO
POST /almacen/articulos   ❌ RECHAZADO (sin permisos de escritura)
PUT /almacen/articulos/:cod ❌ RECHAZADO
DELETE /almacen/articulos/:cod ❌ RECHAZADO
```

### Caso 2: Usuario con solo permisos de ESCRITURA (BUG ANTERIOR)
```
Usuario: Carlos López
Rol: Custom (solo ALMACEN_TALLER_WRITE)
Permisos: [ALMACEN_TALLER_WRITE]

GET /almacen/articulos    ❌ RECHAZADO (sin permisos de lectura) ← AHORA CORRECTO
POST /almacen/articulos   ✅ PERMITIDO
PUT /almacen/articulos/:cod ✅ PERMITIDO
DELETE /almacen/articulos/:cod ✅ PERMITIDO
```

### Caso 3: Usuario con ambos permisos
```
Usuario: Juan Pérez (12345678)
Rol: SUPERADMIN
Permisos: [ALL_READ, ALL_WRITE]

GET /almacen/articulos    ✅ PERMITIDO
POST /almacen/articulos   ✅ PERMITIDO
PUT /almacen/articulos/:cod ✅ PERMITIDO
DELETE /almacen/articulos/:cod ✅ PERMITIDO
```

---

## 🎯 Comportamiento por Tipo de Operación

### Operaciones de LECTURA (GET)
- **Validación**: `AlmacenReadPermissions` decorator
- **Permisos requeridos**: Al menos uno de:
  - `ALMACEN_TALLER_READ`
  - `ALMACEN_COMUN_READ`
  - `ALL_READ`
- **Filtrado**: QueryBuilder filtra artículos según permisos específicos
- **Rechazo**: Si no tiene permisos de lectura → ForbiddenException

### Operaciones de ESCRITURA (POST, PUT, DELETE)
- **Validación**: `AlmacenPermissions` decorator
- **Permisos requeridos**: Al menos uno de:
  - `ALMACEN_TALLER_WRITE`
  - `ALMACEN_COMUN_WRITE`
  - `ALL_WRITE`
- **Rechazo**: Si no tiene permisos de escritura → ForbiddenException

---

## ✅ Validaciones Ejecutadas

- [x] TypeScript compila sin errores
- [x] Tests almacén: 10/10 pasando
- [x] Guard valida permisos de lectura correctamente
- [x] Guard valida permisos de escritura correctamente
- [x] Usuario sin permisos de lectura no puede hacer GET
- [x] Usuario sin permisos de escritura no puede hacer POST/PUT/DELETE
- [x] Filtrado de artículos respeta permisos específicos

---

## 📊 Endpoints Afectados

| Endpoint | Método | Permiso | Cambio |
|----------|--------|--------|--------|
| /almacen/articulos | GET | READ | ✅ Validación agregada |
| /almacen/articulos | POST | WRITE | Sin cambios |
| /almacen/articulos/:cod | PUT | WRITE | Sin cambios |
| /almacen/articulos/:cod | DELETE | WRITE | Sin cambios |
| /almacen/grupos | GET | READ | ✅ Validación agregada |
| /almacen/grupos/:id | GET | READ | ✅ Validación agregada |
| /almacen/grupos | POST | WRITE | Sin cambios |
| /almacen/grupos/:id | PUT | WRITE | Sin cambios |
| /almacen/movimientos/:id | GET | READ | ✅ Validación agregada |

---

## 🔐 Lógica de Guard Mejorada

```typescript
// En AlmacenPermissionsGuard
canActivate(context: ExecutionContext): boolean {
  // 1. Obtener permisos requeridos del decorador
  const requiredPermissions = reflector.get(ALMACEN_PERMISSIONS_KEY, ...);
  const requiredReadPermissions = reflector.get(ALMACEN_READ_PERMISSIONS_KEY, ...);
  
  // 2. Si no hay permisos requeridos, permitir
  if (!requiredPermissions && !requiredReadPermissions) return true;
  
  // 3. Obtener usuario y sus permisos
  const user = req.user;
  const userPermissions = user.roles.flatMap(r => r.permisos);
  
  // 4. Validar permisos de escritura (si aplica)
  if (requiredPermissions) {
    const hasWritePermission = requiredPermissions.some(p => 
      userPermissions.includes(p)
    );
    if (!hasWritePermission) throw ForbiddenException;
  }
  
  // 5. Validar permisos de lectura (si aplica)
  if (requiredReadPermissions) {
    const hasReadPermission = requiredReadPermissions.some(p => 
      userPermissions.includes(p)
    );
    if (!hasReadPermission) throw ForbiddenException;
  }
  
  // 6. Permitir acceso si todas las validaciones pasaron
  return true;
}
```

---

## 🚀 Cómo Probar

### Test 1: Usuario sin permisos de lectura
```bash
# 1. Login como usuario con solo ALMACEN_TALLER_WRITE (sin READ)
POST /auth/login
{
  "dni": "test_dni",
  "password": "password"
}

# 2. Intentar GET artículos
GET /almacen/articulos
Authorization: Bearer {token}

# Respuesta esperada:
# 403 Forbidden
# "User ... does not have required read permissions"
```

### Test 2: Usuario sin permisos de escritura
```bash
# 1. Login como usuario con solo ALMACEN_TALLER_READ (sin WRITE)
POST /auth/login
{
  "dni": "test_dni",
  "password": "password"
}

# 2. Intentar POST artículo
POST /almacen/articulos
Authorization: Bearer {token}
Content-Type: application/json
{
  "codigo": "NEW-001",
  ...
}

# Respuesta esperada:
# 403 Forbidden
# "User ... does not have required write permissions"
```

---

## 📝 Resumen

El bug donde usuarios con solo permisos de escritura podían ver artículos ha sido **CORREGIDO**.

Ahora:
- ✅ GET requiere explícitamente permisos de lectura
- ✅ POST/PUT/DELETE requieren permisos de escritura
- ✅ Se rechaza acceso si falta el permiso específico
- ✅ Filtrado respeta permisos granulares
- ✅ Todos los tests pasan

**Status**: ✅ IMPLEMENTADO Y VALIDADO
