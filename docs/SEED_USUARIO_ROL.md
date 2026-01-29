# Seed Usuario-Rol

## Descripción

El seed de usuario-rol carga las asociaciones entre usuarios y roles desde el archivo CSV `usuario_rol.csv` directamente en la tabla de unión `usuario_rol`.

## Ubicación

- **Archivo CSV**: `src/seed/data/usuario_rol.csv`
- **Servicio**: `src/seed/seed.service.ts`
- **Método**: `seedUsuariosRoles()` (private)

## Estructura del CSV

```csv
dni,rol_id
12345678,1
87654321,2
11223344,1
55667788,3
```

### Campos

- **dni**: DNI del usuario (string numérico, PK de usuario_rol)
- **rol_id**: ID del rol (número, FK a tabla rol)

## Implementación

### 1. Importación de Entidad

```typescript
import { UsuarioRol } from '../usuario/entities/usuario-rol.entity';
```

### 2. Inyección de Repositorio

```typescript
@InjectRepository(UsuarioRol)
private usuarioRolRepository: Repository<UsuarioRol>
```

### 3. Método de Seed

```typescript
private async seedUsuariosRoles(): Promise<number> {
  this.logger.log('Cargando asignaciones usuario-rol...');
  const data = await this.csvReaderService.readCsv('usuario_rol');
  
  const mappedData = data.map((item) => ({
    dni: Number(item.dni),
    rol_id: Number(item.rol_id),
  })) as Partial<UsuarioRol>[];
  
  await this.usuarioRolRepository.save(mappedData);
  this.logger.log(`✓ ${data.length} asignaciones usuario-rol cargadas`);
  return data.length;
}
```

### 4. Integración en Seed Principal

El método se ejecuta en el orden correcto del seed completo:

```typescript
async seed(): Promise<{ message: string; results: Record<string, number> }> {
  // ... otras tablas ...
  
  // Orden de inserción para módulo usuario (respetando FK)
  results['rol'] = await this.seedRoles();
  results['usuario'] = await this.seedUsuarios();
  results['usuario_rol'] = await this.seedUsuariosRoles();  // ← NUEVO
  results['refresh_token'] = await this.seedRefreshTokens();
  // ... más tablas ...
}
```

## Orden de Inserción

El seed respeta la jerarquía de relaciones:

1. **Roles** (tablas padres, sin FK)
2. **Usuarios** (depende de rol -FK rol_id)
3. **Usuario-Rol** ← **NUEVO** (depende de usuario y rol)
4. Otros registros

> **Importante**: Aunque en la relación N:N, los registros de usuario_rol podrían cargarse teóricamente después de usuarios, se cargan inmediatamente después para mantener la integridad referencial clara.

## Auditoría

La entidad `UsuarioRol` incluye campos de auditoría:

- **fecha_asignacion**: Timestamp de creación (auto-generado)
- **fecha_actualizacion**: Timestamp de última actualización (auto-generado)

Estos campos se poblarán automáticamente en la inserción.

## Validaciones Implícitas

TypeORM ejecuta validaciones automáticas:

- **FK constraint**: El `dni` debe existir en tabla `usuario`
- **FK constraint**: El `rol_id` debe existir en tabla `rol`
- **PK constraint**: No pueden haber duplicados (dni, rol_id)
- **NOT NULL**: Ambos campos son obligatorios

## Ejecución

### Método 1: Seed Completo

```bash
POST /seed
```

Carga todas las tablas incluyendo usuario_rol.

### Método 2: Seed Solo Usuarios (ACTUALIZADO)

```bash
POST /seed/users
```

En `seedUsers()` se carga:
1. Usuarios
2. Refresh tokens

**Nota**: El método `seedUsers()` no incluye usuario_rol. Si necesita cargar roles con usuarios, use el seed completo.

## Ejemplo de Datos Cargados

Después de ejecutar el seed, la tabla `usuario_rol` contendrá:

| dni      | rol_id | fecha_asignacion        | fecha_actualizacion    |
|----------|--------|-------------------------|------------------------|
| 12345678 | 1      | 2026-01-29 01:43:09.123 | 2026-01-29 01:43:09.123|
| 87654321 | 2      | 2026-01-29 01:43:09.456 | 2026-01-29 01:43:09.456|
| 11223344 | 1      | 2026-01-29 01:43:09.789 | 2026-01-29 01:43:09.789|
| 55667788 | 3      | 2026-01-29 01:43:10.012 | 2026-01-29 01:43:10.012|

## Relaciones Después del Seed

Después de cargar el seed completo:

- **Usuario 12345678** tiene el rol **1** (ID)
- **Usuario 87654321** tiene el rol **2** (ID)
- **Usuario 11223344** tiene el rol **1** (ID)
- **Usuario 55667788** tiene el rol **3** (ID)

Los usuarios pueden ahora acceder al sistema con sus permisos combinados.

## Modificar Datos del Seed

Para agregar nuevas asociaciones usuario-rol:

1. Editar `src/seed/data/usuario_rol.csv`
2. Agregar nueva fila con formato: `dni,rol_id`
3. Ejecutar seed de nuevo

Ejemplo (agregar un nuevo usuario con rol):

```csv
dni,rol_id
12345678,1
87654321,2
11223344,1
55667788,3
99999999,4  # ← Nueva línea
```

## Troubleshooting

### Error: "FK constraint violation"

**Causa**: El dni o rol_id no existen en sus tablas padres.

**Solución**: Verificar que:
- El usuario con ese dni existe en tabla `usuario`
- El rol con ese id existe en tabla `rol`
- Los datos en usuario_rol.csv son válidos

### Error: "Duplicate key value"

**Causa**: Ya existe una asociación para ese usuario-rol.

**Solución**: Verificar el CSV no tiene duplicados en las columnas (dni, rol_id).

### Logs

El seed produce logs informativos:

```
[Nest] ... SeedService Cargando asignaciones usuario-rol...
[Nest] ... SeedService ✓ 4 asignaciones usuario-rol cargadas
```

## Cambios Realizados

### Archivo: `src/seed/seed.service.ts`

1. **Importación**: Agregada `UsuarioRol` entity
2. **Inyección**: Agregado `UsuarioRolRepository`
3. **Método**: Creado `seedUsuariosRoles()`
4. **Integración**: Agregada llamada en `seed()` después de `seedUsuarios()`

## Próximos Pasos

El seed usuario-rol es completo. El sistema ahora:

✅ Carga usuarios  
✅ Carga roles  
✅ Carga asociaciones usuario-rol  
✅ Mantiene integridad referencial  
✅ Audita asignaciones  

El sistema está listo para operar con permisos granulares y roles múltiples por usuario.
