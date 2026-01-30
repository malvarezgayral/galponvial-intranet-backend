# Resumen de Archivos Modificados y Creados

## Archivos Creados

### 1. `/src/usuario/decorators/almacen-permissions.decorator.ts`
- **Propósito**: Decorador para especificar permisos requeridos de almacén
- **Exporta**: `AlmacenPermissions()` - función decoradora y constante `ALMACEN_PERMISSIONS_KEY`

### 2. `/src/usuario/guards/almacen-permissions.guard.ts`
- **Propósito**: Guard que valida permisos granulares de almacén
- **Implementa**: `CanActivate` de NestJS
- **Lógica**: Verifica que el usuario tenga al menos uno de los permisos requeridos

### 3. `/CAMBIOS_PERMISOS_ARTICULOS.md`
- **Propósito**: Documentación completa de todos los cambios realizados

## Archivos Modificados

### Entities (Entidades)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/entities/sector-galpon.entity.ts` | Agregado campo `tipo` con enum `SectorTipo` |

### Enumerations (Enumeraciones)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/enums/almacen.enum.ts` | Nuevo enum `SectorTipo` con valores `ALMACEN_TALLER` y `ALMACEN_COMUN` |
| `src/usuario/enums/usuario.enum.ts` | Actualizado enum `Permisos` con permisos granulares específicos por área |

### DTOs (Data Transfer Objects)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/dto/create-articulo.dto.ts` | Agregados campos `grupo_id` (obligatorio) y `unidad_medida_id` (opcional) |

### Services (Servicios)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/almacen.service.ts` | 1. Agregado `SectorGalponRepository` 2. Nuevos métodos: `getSectorTipoByArticulo()` y `getSectorTipoByGrupo()` |
| `src/seed/seed.service.ts` | Actualizado método `seedRoles()` para manejar nueva estructura |

### Controllers (Controladores)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/almacen.controller.ts` | Agregados `@UseGuards(AlmacenPermissionsGuard)` y `@AlmacenPermissions(...)` en endpoints de escritura |

### Modules (Módulos)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/almacen.module.ts` | Agregado `exports: [AlmacenService]` |

### Tests (Pruebas)
| Archivo | Cambios |
|---------|---------|
| `src/almacen/almacen.service.spec.ts` | Agregados mocks para `UnidadMedidaCuant` y `SectorGalpon`, actualizado test |
| `src/almacen/almacen.controller.spec.ts` | Actualizado test para pasar parámetros de paginación |

### Data Files (Archivos de Datos)
| Archivo | Cambios |
|---------|---------|
| `src/seed/data/sectores_galpon.csv` | Agregada columna `tipo` |
| `src/seed/data/roles.csv` | Rediseñada estructura para permisos granulares |

## Estadísticas

- **Archivos creados**: 3
- **Archivos modificados**: 12
- **Nuevos métodos**: 2
- **Nuevos guards**: 1
- **Nuevos decoradores**: 1
- **Nuevos enums**: 1

## Orden de Aplicación Recomendado

Para implementar estos cambios en un proyecto existente:

1. **Actualizar enumeraciones** (usuario.enum.ts, almacen.enum.ts)
2. **Actualizar entidades** (sector-galpon.entity.ts)
3. **Crear decoradores y guards** (almacen-permissions.decorator.ts, almacen-permissions.guard.ts)
4. **Actualizar DTOs** (create-articulo.dto.ts)
5. **Actualizar servicios** (almacen.service.ts)
6. **Actualizar controladores** (almacen.controller.ts)
7. **Actualizar módulos** (almacen.module.ts)
8. **Actualizar datos de seed** (roles.csv, sectores_galpon.csv)
9. **Actualizar seed service** (seed.service.ts)
10. **Actualizar tests** (almacen.service.spec.ts, almacen.controller.spec.ts)
11. **Generar y ejecutar migraciones de base de datos**

## Cambios de Base de Datos Requeridos

```sql
-- Agregar columna tipo a sector_galpon
ALTER TABLE sector_galpon ADD COLUMN tipo ENUM('almacen-taller', 'almacen-comun') NOT NULL DEFAULT 'almacen-comun';

-- Actualizar datos existentes (según corresponda)
UPDATE sector_galpon SET tipo = 'almacen-taller' WHERE id IN (1, 4);
UPDATE sector_galpon SET tipo = 'almacen-comun' WHERE id IN (2, 3, 5);
```
