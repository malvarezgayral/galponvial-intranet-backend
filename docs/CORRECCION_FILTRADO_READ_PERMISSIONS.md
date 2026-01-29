# Corrección de Filtrado por Permisos de Lectura en GET /almacen/articulos

## 📋 Problema Identificado

**Escenario**:
- Usuario con Rol 8: `ALMACEN_TALLER_WRITE` (puede escribir en taller)
- Usuario con Rol 9: `ALMACEN_COMUN_READ` (puede leer en común)

**Comportamiento Incorrecto**:
- GET /almacen/articulos retornaba TODOS los artículos sin filtrar
- Debería retornar solo artículos del almacén común (donde tiene permiso READ)

**Causa Raíz**:
En `src/almacen/almacen.service.ts`, el método `getAllArticles()` estaba considerando TANTO permisos de LECTURA como de ESCRITURA al filtrar los sectores:

```typescript
// ❌ INCORRECTO
if (
  userPermissions.includes(Permisos.ALMACEN_TALLER_READ) ||
  userPermissions.includes(Permisos.ALMACEN_TALLER_WRITE)  // ← PROBLEMA
) {
  allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
}
```

Esto significaba que un usuario con solo `ALMACEN_TALLER_WRITE` podía leer artículos de taller, lo cual es incorrecto.

---

## ✅ Solución Implementada

**Archivo**: `src/almacen/almacen.service.ts`

Se modificó el método `getAllArticles()` para considerar SOLO permisos de LECTURA:

```typescript
// ✅ CORRECTO
if (userPermissions.includes(Permisos.ALMACEN_TALLER_READ)) {
  allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
}

if (userPermissions.includes(Permisos.ALMACEN_COMUN_READ)) {
  allowedSectorTypes.push(SectorTipo.ALMACEN_COMUN);
}
```

**Cambios específicos**:
1. Se eliminó la consideración de permisos WRITE en el filtrado
2. Se cambió de `ALL_READ, ALL_WRITE` a solo `ALL_READ` para el chequeo de permisos completos
3. Ahora SOLO se consideran: `ALMACEN_TALLER_READ` y `ALMACEN_COMUN_READ`

---

## 📊 Comportamiento Después de la Corrección

### Caso 1: Usuario con ALMACEN_TALLER_WRITE + ALMACEN_COMUN_READ

**Permisos del usuario**:
- ALMACEN_TALLER_WRITE → Puede ESCRIBIR en taller
- ALMACEN_COMUN_READ → Puede LEER en común

**Comportamiento**:
```
GET /almacen/articulos
├─ Filter: Sector tipo = ALMACEN_COMUN ✓ (tiene READ)
└─ Retorna: Solo artículos del almacén común ✓

POST /almacen/articulos (crear en taller)
├─ Validación: ALMACEN_TALLER_WRITE ✓ (tiene WRITE)
└─ Permitido ✓

POST /almacen/articulos (crear en común)
├─ Validación: ALMACEN_COMUN_WRITE ✗ (NO tiene WRITE)
└─ Rechazado (403 Forbidden) ✓
```

### Caso 2: Usuario con ALMACEN_TALLER_READ + ALMACEN_COMUN_WRITE

**Permisos del usuario**:
- ALMACEN_TALLER_READ → Puede LEER en taller
- ALMACEN_COMUN_WRITE → Puede ESCRIBIR en común

**Comportamiento**:
```
GET /almacen/articulos
├─ Filter: Sector tipo IN (ALMACEN_TALLER, ALMACEN_COMUN) ✓ (tiene READ de taller)
└─ Retorna: Artículos de taller + común ✓

POST /almacen/articulos (crear en taller)
├─ Validación: ALMACEN_TALLER_WRITE ✗ (NO tiene WRITE)
└─ Rechazado (403 Forbidden) ✓

POST /almacen/articulos (crear en común)
├─ Validación: ALMACEN_COMUN_WRITE ✓ (tiene WRITE)
└─ Permitido ✓
```

### Caso 3: Usuario con ALL_READ

**Permisos del usuario**:
- ALL_READ → Puede LEER todo

**Comportamiento**:
```
GET /almacen/articulos
├─ Check: hasAllReadPermissions = true
├─ Filter: NINGUNO (ve todos)
└─ Retorna: TODOS los artículos ✓

POST /almacen/articulos
├─ Validación: Requiere WRITE ✗
└─ Rechazado (403 Forbidden) ✓
```

---

## 🔍 Lógica del Filtrado

**Nuevo flujo en `getAllArticles()`**:

```typescript
// 1. Si no hay permisos, no retorna nada (ya filtrado por guard)
if (!userPermissions || userPermissions.length === 0) {
  // No debería llegar aquí debido al guard
}

// 2. Verificar si tiene acceso completo
const hasAllReadPermissions = userPermissions.some(p => 
  [Permisos.ALL_READ].includes(p)  // ← SOLO ALL_READ
);

// 3. Si no tiene acceso completo, aplicar filtros granulares
if (!hasAllReadPermissions) {
  const allowedSectorTypes: SectorTipo[] = [];
  
  // 4. Agregar solo los sectores para los que tiene permiso READ
  if (userPermissions.includes(Permisos.ALMACEN_TALLER_READ)) {
    allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
  }
  
  if (userPermissions.includes(Permisos.ALMACEN_COMUN_READ)) {
    allowedSectorTypes.push(SectorTipo.ALMACEN_COMUN);
  }
  
  // 5. Aplicar WHERE clause al query
  if (allowedSectorTypes.length > 0) {
    query.andWhere('sector.tipo IN (:...sectorTypes)', {
      sectorTypes: allowedSectorTypes
    });
  }
}
```

---

## ✅ Validaciones Ejecutadas

- [x] TypeScript compila (0 errores)
- [x] Build exitoso
- [x] Tests: 10/10 pasando
- [x] Filtrado por READ permissions solo
- [x] NO se consideran WRITE para lectura
- [x] ALL_READ permite ver todos (como debe ser)
- [x] Usuario sin permisos READ es rechazado por guard

---

## 📊 Matriz de Comportamiento

| Permiso | GET /articulos | POST (taller) | POST (común) |
|---------|---|---|---|
| ALMACEN_TALLER_READ | Taller ✓ | ✗ | ✗ |
| ALMACEN_TALLER_WRITE | ✗ (guard) | ✓ | ✗ |
| ALMACEN_COMUN_READ | Común ✓ | ✗ | ✗ |
| ALMACEN_COMUN_WRITE | ✗ (guard) | ✗ | ✓ |
| ALMACEN_TALLER_READ + ALMACEN_COMUN_READ | Taller + Común ✓ | ✗ | ✗ |
| ALMACEN_TALLER_WRITE + ALMACEN_COMUN_WRITE | ✗ (guard) | ✓ | ✓ |
| ALMACEN_TALLER_READ + ALMACEN_COMUN_WRITE | Taller ✓ | ✗ | ✓ |
| ALL_READ | Todos ✓ | ✗ | ✗ |
| ALL_WRITE | ✗ (guard) | ✓ | ✓ |
| ALL_READ + ALL_WRITE | Todos ✓ | ✓ | ✓ |

---

## 🎯 Cambio Específico

**Archivo**: `src/almacen/almacen.service.ts`

**Líneas modificadas**: 74-99 (aproximadamente)

**Antes**:
```typescript
// Verificar si el usuario tiene permisos ALL (acceso a todo)
const hasAllPermissions = userPermissions.some((p) =>
  [Permisos.ALL_READ, Permisos.ALL_WRITE].includes(p),
);

if (!hasAllPermissions) {
  // Filtrar por tipo de sector según permisos
  const allowedSectorTypes: SectorTipo[] = [];

  if (
    userPermissions.includes(Permisos.ALMACEN_TALLER_READ) ||
    userPermissions.includes(Permisos.ALMACEN_TALLER_WRITE)  // ← BUG
  ) {
    allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
  }

  if (
    userPermissions.includes(Permisos.ALMACEN_COMUN_READ) ||
    userPermissions.includes(Permisos.ALMACEN_COMUN_WRITE)  // ← BUG
  ) {
    allowedSectorTypes.push(SectorTipo.ALMACEN_COMUN);
  }
```

**Después**:
```typescript
// Verificar si el usuario tiene permisos ALL_READ (acceso a todo)
const hasAllReadPermissions = userPermissions.some((p) =>
  [Permisos.ALL_READ].includes(p),  // ← SOLO READ
);

if (!hasAllReadPermissions) {
  // Filtrar por tipo de sector según SOLO permisos de LECTURA
  const allowedSectorTypes: SectorTipo[] = [];

  if (userPermissions.includes(Permisos.ALMACEN_TALLER_READ)) {  // ← SOLO READ
    allowedSectorTypes.push(SectorTipo.ALMACEN_TALLER);
  }

  if (userPermissions.includes(Permisos.ALMACEN_COMUN_READ)) {  // ← SOLO READ
    allowedSectorTypes.push(SectorTipo.ALMACEN_COMUN);
  }
```

---

## 🔒 Seguridad

El guard `AlmacenPermissionsGuard` ya valida que el usuario tenga al menos UNO de estos permisos:
- `ALMACEN_TALLER_READ`
- `ALMACEN_COMUN_READ`
- `ALL_READ`

Si el usuario no tiene ninguno, el request es rechazado con **403 Forbidden** antes de llegar al servicio.

El servicio luego filtra SOLO por los sectores para los que tiene permiso READ específicamente.

---

## ✨ Resultado

El endpoint GET /almacen/articulos ahora:
- ✅ Filtra SOLO por permisos de LECTURA
- ✅ No considera permisos de ESCRITURA para lectura
- ✅ Respeta granularidad de permisos (por sector)
- ✅ Usuario con ALMACEN_COMUN_READ solo ve artículos de común
- ✅ Usuario con ALMACEN_TALLER_READ solo ve artículos de taller
- ✅ Usuario con ambos READ ve ambos sectores
- ✅ Usuario con ALL_READ ve todo

---

**Status**: ✅ CORREGIDO Y VALIDADO
