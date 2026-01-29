# Cambios Implementados - Sistema de Permisos Granulares para Almacén

## Resumen de Cambios

Se han implementado cambios significativos en el sistema de almacén para agregar granularidad en los permisos basados en el tipo de sector (almacén-taller vs almacén-común). La jerarquía de relaciones ahora es:

**Artículo → Grupo de Artículos → Sector del Galpón → Tipo de Sector**

## Cambios Detallados

### 1. **Entidades Actualizadas**

#### `SectorGalpon` (sector-galpon.entity.ts)
- **Cambio**: Agregado campo `tipo` con enum `SectorTipo`
- **Valores posibles**: 
  - `almacen-taller`
  - `almacen-comun`
- **Propósito**: Identificar el área a la que pertenece cada sector del galpón

### 2. **Enumeraciones Actualizadas**

#### `almacen.enum.ts`
- **Nuevo enum `SectorTipo`**:
  ```typescript
  export enum SectorTipo {
    ALMACEN_TALLER = 'almacen-taller',
    ALMACEN_COMUN = 'almacen-comun',
  }
  ```

#### `usuario.enum.ts`
- **Enumeración `Permisos` actualizada con permisos granulares**:
  - `ALMACEN_TALLER_READ`: Lectura en almacén-taller
  - `ALMACEN_TALLER_WRITE`: Escritura en almacén-taller
  - `ALMACEN_COMUN_READ`: Lectura en almacén-común
  - `ALMACEN_COMUN_WRITE`: Escritura en almacén-común
  - `ALL_READ`: Lectura en todas las áreas
  - `ALL_WRITE`: Escritura en todas las áreas

### 3. **CSV de Datos Actualizados**

#### `sectores_galpon.csv`
- **Cambio**: Agregada columna `tipo`
- **Ejemplo**:
  ```
  id,nro_sector,tipo,descripcion
  1,1,almacen-taller,repuestos de automotores
  2,2,almacen-comun,articulos de limpieza
  ```

#### `roles.csv`
- **Cambio**: Estructura rediseñada para permisos granulares
- **Nueva estructura**: Cada fila representa un rol con un permiso específico
- **Ejemplo**:
  ```
  id,rol,permisos
  1,user,almacen-taller:read
  2,user,almacen-comun:read
  3,superuser,almacen-taller:read
  4,superuser,almacen-taller:write
  ```

### 4. **DTOs Actualizados**

#### `CreateArticuloDto` (create-articulo.dto.ts)
- **Cambio**: Agregados campos obligatorios para relaciones
- **Nuevos campos**:
  - `grupo_id` (obligatorio): ID del grupo al que pertenece el artículo
  - `unidad_medida_id` (opcional): ID de la unidad de medida

### 5. **Seguridad - Guards y Decoradores**

#### Nuevo Decorador: `AlmacenPermissions` (almacen-permissions.decorator.ts)
- Permite especificar los permisos requeridos para ejecutar una acción
- Uso:
  ```typescript
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  ```

#### Nuevo Guard: `AlmacenPermissionsGuard` (almacen-permissions.guard.ts)
- Valida que el usuario tenga los permisos requeridos
- Verifica los permisos del rol del usuario contra los requeridos
- Lanza `ForbiddenException` si el usuario no tiene permisos

### 6. **Servicio de Almacén Actualizado**

#### `AlmacenService` (almacen.service.ts)
- **Nuevos métodos**:
  - `getSectorTipoByArticulo(codArticulo)`: Obtiene el tipo de sector de un artículo
  - `getSectorTipoByGrupo(idGrupo)`: Obtiene el tipo de sector de un grupo

- **Cambios en inyección de dependencias**:
  - Agregado `SectorGalponRepository` para consultar información de sectores

### 7. **Controlador de Almacén Actualizado**

#### `AlmacenController` (almacen.controller.ts)
- **Cambios en endpoints de escritura**:
  - `POST /almacen/articulos`: Agregado `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)`
  - `PUT /almacen/articulos/:cod`: Agregado `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)`
  - `DELETE /almacen/articulos/:cod`: Agregado `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)`
  - `POST /almacen/grupos`: Agregado `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)`
  - `PUT /almacen/grupos/:id`: Agregado `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)`

- **Permisos requeridos** para operaciones de escritura:
  ```typescript
  @AlmacenPermissions(
    Permisos.ALMACEN_TALLER_WRITE,
    Permisos.ALMACEN_COMUN_WRITE,
    Permisos.ALL_WRITE,
  )
  ```

### 8. **Módulo de Almacén Actualizado**

#### `AlmacenModule` (almacen.module.ts)
- Agregado `exports: [AlmacenService]` para permitir uso en otros módulos

### 9. **Tests Actualizados**

#### `almacen.service.spec.ts`
- Agregados mocks para `UnidadMedidaCuant` y `SectorGalpon`
- Actualizado test `getAllArticles` para verificar el nuevo comportamiento paginado

#### `almacen.controller.spec.ts`
- Actualizado test `getAllArticles` para pasar los parámetros de paginación

### 10. **Seed Service Actualizado**

#### `seed.service.ts`
- Actualizado método `seedRoles()` para manejar correctamente la nueva estructura de permisos

## Flujo de Validación de Permisos

```
Usuario realiza acción (crear/editar/eliminar artículo)
  ↓
JwtAuthGuard: Valida token JWT
  ↓
UserValidRoleGuard: Valida rol básico
  ↓
AlmacenPermissionsGuard: Valida permisos específicos de almacén
  ↓
Acción permitida o rechazada
```

## Ejemplo de Uso

### Crear un usuario con permisos limitados

```csv
dni,nombre,apellido,email,password,isActive,tokenVersion,fecha_alta,fecha_baja,rol_id
12345678,Juan,Pérez,juan@example.com,password123,true,0,2024-01-15,,1
```

Donde `rol_id=1` corresponde a un usuario con permisos `almacen-taller:read` (según roles.csv).

### Crear un artículo

```bash
POST /almacen/articulos
{
  "nombre": "Filtro de aire",
  "modelo": "FA-100",
  "descripcion": "Filtro de aire para motores diesel",
  "unidad_tipo": "pieza",
  "stock": 3,
  "grupo_id": 1,
  "cod_proveedor": "PROV-FA-100",
  "unidad_medida_id": null
}
```

El usuario debe tener uno de estos permisos:
- `almacen-taller:write` (si el grupo está en almacén-taller)
- `almacen-comun:write` (si el grupo está en almacén-común)
- `all:write` (acceso total)

## Migración de Base de Datos

Será necesario ejecutar un script de migración para:

1. Agregar la columna `tipo` a la tabla `sector_galpon`
2. Poblar los datos existentes con el tipo correspondiente
3. Actualizar la tabla `rol` para reflejar la nueva estructura de permisos

## Notas Importantes

- Los permisos ahora son **granulares y específicos por área** (almacén-taller/almacén-común)
- La validación de permisos ocurre en cada endpoint de escritura
- Los endpoints de lectura aún pueden ser accedidos con roles básicos
- Se mantiene compatibilidad con la estructura anterior de roles mediante la herencia de JwtAuthGuard y UserValidRoleGuard
