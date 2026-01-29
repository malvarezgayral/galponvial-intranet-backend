# Corrección: Validación de Permisos WRITE por Sector

**Fecha**: 29 de enero de 2026  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Validado

---

## 🐛 Problema Identificado

### Escenario de Prueba
Usuario Admin con permisos:
- `7` (ALMACEN_TALLER_READ) - Lectura en taller
- `10` (ALMACEN_COMUN_WRITE) - Escritura en común

### Comportamiento Incorrecto
1. **Caso 1 - Correcto**: Crear artículo con `grupo_id = 5` (pertenece a sector COMÚN)
   - ✅ Funcionó (esperado)
   
2. **Caso 2 - Incorrecto**: Crear artículo con `grupo_id = 3` (pertenece a sector TALLER)
   - ✅ Funcionó (no debería permitirse)
   - ❌ Usuario NO tiene `ALMACEN_TALLER_WRITE`

### Causa Raíz
Los endpoints de **creación, actualización y eliminación** tenían:
- ✅ Validación de guard (usuario tiene ALGÚNavalor WRITE)
- ❌ SIN validación de **sector específico**
- ❌ SIN validación en el **servicio**

El guard solo validaba: "¿Tiene ALGÚN permiso WRITE?"
El servicio NO validaba: "¿Tiene permiso WRITE para ESTE SECTOR específico?"

---

## ✅ Solución Implementada

### Cambios en Controlador (`almacen.controller.ts`)

#### 1. POST /articulos - createArticle
**Antes**: Solo pasaba el DTO
```typescript
async createArticle(@Body() dto: CreateArticuloDto) {
  return await this.almacenService.createArticle(dto);
}
```

**Ahora**: Extrae permisos del usuario y los pasa
```typescript
async createArticle(
  @Body() dto: CreateArticuloDto,
  @GetUser() user: Usuario,
) {
  const userRoles = user.roles ?? [];
  const userPermissions: Permisos[] = userRoles.flatMap(
    (role) => role.permisos ?? [],
  );
  return await this.almacenService.createArticle(dto, userPermissions);
}
```

#### 2. PUT /articulos/:cod - updateArticle
Mismo patrón: extrae y pasa permisos

#### 3. DELETE /articulos/:cod - deleteArticle
Mismo patrón: extrae y pasa permisos

#### 4. POST /grupos - createGroup
Mismo patrón: extrae y pasa permisos

#### 5. PUT /grupos/:id - updateGroup
Mismo patrón: extrae y pasa permisos

#### 6. POST /movimientos - createMovimiento
**Antes**: Sin protección de guard
**Ahora**: 
- ✅ Agregado `@UseGuards(AlmacenPermissionsGuard)`
- ✅ Agregado `@AlmacenPermissions(...)`
- ✅ Extrae y pasa permisos del usuario

---

### Cambios en Servicio (`almacen.service.ts`)

#### 1. Importar ForbiddenException
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
```

#### 2. Método auxiliar: validateWritePermissionBySectorTipo (NUEVO)
```typescript
private validateWritePermissionBySectorTipo(
  sectorTipo: SectorTipo,
  userPermissions: Permisos[],
): void {
  const hasAllWritePermissions = userPermissions.some((p) =>
    [Permisos.ALL_WRITE].includes(p),
  );

  if (hasAllWritePermissions) {
    return; // Tiene acceso total
  }

  // Validar permisos según el sector
  if (sectorTipo === SectorTipo.ALMACEN_TALLER) {
    if (!userPermissions.includes(Permisos.ALMACEN_TALLER_WRITE)) {
      throw new ForbiddenException(
        'No tiene permisos de escritura en el almacén de taller',
      );
    }
  } else if (sectorTipo === SectorTipo.ALMACEN_COMUN) {
    if (!userPermissions.includes(Permisos.ALMACEN_COMUN_WRITE)) {
      throw new ForbiddenException(
        'No tiene permisos de escritura en el almacén común',
      );
    }
  }
}
```

#### 3. Método auxiliar: validateWritePermissionByGrupoId (REFACTORIZADO)
- Obtiene el grupo con su sector
- Delega validación a `validateWritePermissionBySectorTipo`
- Lanza BadRequestException si el grupo no existe
- Lanza ForbiddenException si no tiene permiso WRITE para ese sector

#### 4. Método auxiliar: validateWritePermissionByArticuloCod (REFACTORIZADO)
- Obtiene el artículo con su grupo y sector
- Delega validación a `validateWritePermissionBySectorTipo`
- Lanza NotFoundException si artículo no existe
- Lanza ForbiddenException si no tiene permiso WRITE para ese sector

#### 5. createArticle
**Antes**:
```typescript
async createArticle(dto: CreateArticuloDto) {
  const art = this.articuloRepo.create(dto);
  return await this.articuloRepo.save(art);
}
```

**Ahora**:
```typescript
async createArticle(
  dto: CreateArticuloDto,
  userPermissions?: Permisos[],
) {
  // Validar permisos WRITE para el sector del grupo
  if (userPermissions && userPermissions.length > 0) {
    await this.validateWritePermissionByGrupoId(dto.grupo_id, userPermissions);
  }

  const art = this.articuloRepo.create(dto);
  return await this.articuloRepo.save(art);
}
```

#### 6. updateArticle
Valida:
1. Permisos WRITE para el sector del artículo actual
2. Si se cambia de grupo, valida permisos WRITE para el nuevo sector

#### 7. deleteArticle
Valida permisos WRITE para el sector del artículo antes de eliminarlo

#### 8. createGroup
Valida permisos WRITE para el sector especificado en `sector_id`

#### 9. updateGroup
Valida:
1. Permisos WRITE para el sector actual del grupo
2. Si se cambia de sector, valida permisos para el nuevo sector

#### 10. createMovimiento
Valida permisos WRITE para el sector del artículo en el que se registra el movimiento

---

## 📊 Matriz de Comportamiento (POST /almacen/articulos)

| Usuario Permisos | grupo_id | Sector Grupo | Resultado |
|---|---|---|---|
| ALMACEN_TALLER_READ | 3 | TALLER | ❌ 403 Forbidden (sin WRITE) |
| ALMACEN_TALLER_WRITE | 3 | TALLER | ✅ 201 Created |
| ALMACEN_TALLER_WRITE | 5 | COMÚN | ❌ 403 Forbidden (sin WRITE común) |
| ALMACEN_COMUN_WRITE | 5 | COMÚN | ✅ 201 Created |
| ALMACEN_COMUN_WRITE | 3 | TALLER | ❌ 403 Forbidden (sin WRITE taller) |
| ALL_WRITE | cualquiera | cualquiera | ✅ 201 Created |
| TALLER_WRITE + COMUN_WRITE | 3 | TALLER | ✅ 201 Created |
| TALLER_WRITE + COMUN_WRITE | 5 | COMÚN | ✅ 201 Created |

---

## 🔄 Endpoints Afectados

### Artículos
- ✅ `POST /almacen/articulos` - createArticle
- ✅ `PUT /almacen/articulos/:cod` - updateArticle
- ✅ `DELETE /almacen/articulos/:cod` - deleteArticle

### Grupos
- ✅ `POST /almacen/grupos` - createGroup
- ✅ `PUT /almacen/grupos/:id` - updateGroup

### Movimientos
- ✅ `POST /almacen/movimientos` - createMovimiento (además agregó validación de guard)

---

## 🧪 Validaciones Ejecutadas

```
TypeScript Compilation:
  ✅ 0 errors
  ✅ No warnings

Test Suite:
  ✅ almacen.service.spec.ts PASS
  ✅ almacen.controller.spec.ts PASS
  ✅ Test Suites: 2 passed, 2 total
  ✅ Tests: 10 passed, 10 total

Build:
  ✅ Success
```

---

## 🔒 Principios de Seguridad Respetados

1. **Separación de Responsabilidades**
   - Guard: Validar que tiene ALGÚN permiso WRITE
   - Servicio: Validar que tiene permiso WRITE para EL SECTOR específico

2. **Granularidad por Sector**
   - ALMACEN_TALLER_WRITE solo afecta sector TALLER
   - ALMACEN_COMUN_WRITE solo afecta sector COMÚN
   - ALL_WRITE accede a todos los sectores

3. **Coherencia con Lecturas**
   - READ: Se valida en guard y se filtra en servicio (como fase anterior)
   - WRITE: Ahora también se valida en guard y se valida en servicio
   - Patrón consistente para ambos tipos de permisos

4. **Errores Claros**
   - 403 Forbidden: No tiene permiso WRITE para ese sector
   - 400 Bad Request: Grupo/Sector/Artículo no existe
   - 404 Not Found: Artículo/Grupo no encontrado

---

## 📝 Ejemplo de Flujo Completo

### Usuario: admin con ALMACEN_TALLER_WRITE + ALMACEN_COMUN_READ

#### Caso 1: POST /almacen/articulos con grupo_id=5 (ALMACEN_COMUN)
```
1. Request llega al endpoint
2. Guard valida: ¿Tiene ALMACEN_TALLER_WRITE, ALMACEN_COMUN_WRITE o ALL_WRITE?
   ✅ Tiene ALMACEN_TALLER_WRITE → Pasa guard
3. Servicio valida: 
   a) Obtiene grupo_id=5 → sector=ALMACEN_COMUN
   b) ¿Tiene ALMACEN_COMUN_WRITE?
   ❌ NO (solo tiene READ en común, WRITE en taller)
   → ForbiddenException: "No tiene permisos de escritura en el almacén común"
4. Response: 403 Forbidden
```

#### Caso 2: POST /almacen/articulos con grupo_id=3 (ALMACEN_TALLER)
```
1. Request llega al endpoint
2. Guard valida: ¿Tiene ALGÚN WRITE?
   ✅ Tiene ALMACEN_TALLER_WRITE → Pasa guard
3. Servicio valida:
   a) Obtiene grupo_id=3 → sector=ALMACEN_TALLER
   b) ¿Tiene ALMACEN_TALLER_WRITE?
   ✅ SÍ
4. Artículo se crea exitosamente
5. Response: 201 Created
```

---

## 🚀 Conclusión

La corrección implementa validación **granular por sector** en todos los endpoints de escritura:

✅ **POST** (crear) - Valida sector del nuevo recurso  
✅ **PUT** (actualizar) - Valida sector del recurso actual y nuevo  
✅ **DELETE** (eliminar) - Valida sector del recurso a eliminar  

Ahora el usuario con `ALMACEN_TALLER_WRITE + ALMACEN_COMUN_READ`:
- ✅ Puede crear artículos SOLO en taller
- ✅ Puede actualizar artículos SOLO en taller
- ✅ Puede eliminar artículos SOLO en taller
- ❌ NO puede operar en común (solo tiene READ)
- ❌ NO puede ver todos los artículos (solo ve común por READ)

**Sistema ahora es coherente y seguro.**
