# Arquitectura de Permisos - Galpon Vial

## Visión General

El sistema galpon-vial implementa un **sistema granular de permisos basado en roles** que permite:

1. **Usuarios con múltiples roles** (relación N:N)
2. **Permisos combinados automáticamente**
3. **Filtrado de datos por permisos** a nivel de QueryBuilder
4. **Visibilidad controlada** de artículos según sector

## Arquitectura de Roles y Permisos

### Entidades

```
Usuario (1 --< N) Rol
├─ dni (PK)
├─ nombre
├─ email
├─ roles: Rol[] ✨ (Many-to-Many)
└─ ...

Rol (N --< 1) Usuario
├─ id (PK)
├─ rol: ValidRoles (enum: admin, superuser, user)
├─ permisos: Permisos[] (array: ALMACEN_TALLER_READ, etc)
└─ usuarios: Usuario[]

usuario_rol (Join Table)
├─ dni (FK -> Usuario)
└─ rol_id (FK -> Rol)
```

### Enumeraciones

**ValidRoles**:
- `admin` - Administrador del sistema
- `superuser` - Super usuario con permisos limitados
- `user` - Usuario básico

**Permisos**:
- `ALMACEN_TALLER_READ` - Lectura almacén taller
- `ALMACEN_TALLER_WRITE` - Escritura almacén taller
- `ALMACEN_COMUN_READ` - Lectura almacén común
- `ALMACEN_COMUN_WRITE` - Escritura almacén común
- `ALL_READ` - Lectura acceso total
- `ALL_WRITE` - Escritura acceso total

## Flujo de Autenticación y Autorización

```
1. Cliente envía JWT
                    ↓
2. JwtAccessStrategy valida y carga usuario
                    ↓
3. Usuario incluye: roles[] (eager loaded)
                    ↓
4. Controlador extrae permisos combinados
                    ↓
5. Guards verifican permisos
                    ↓
6. Service filtra datos según permisos
```

## Ejemplo Completo

### 1. Usuario con Múltiples Roles

```typescript
// Ana Martínez (dni: 55667788)
User {
  dni: 55667788,
  nombre: "Ana",
  roles: [
    {
      id: 5,
      rol: "superuser",
      permisos: ["almacen-comun:read", "almacen-comun:write"]
    },
    {
      id: 3,
      rol: "superuser",
      permisos: ["almacen-taller:read", "almacen-taller:write"]
    }
  ]
}
```

### 2. Extracción de Permisos

```typescript
// Controlador
const userRoles = user.roles ?? [];
const userPermissions = userRoles.flatMap(r => r.permisos ?? []);

// Resultado:
userPermissions = [
  "almacen-comun:read",
  "almacen-comun:write",
  "almacen-taller:read",
  "almacen-taller:write"
]
```

### 3. Filtrado de Artículos

```typescript
// Servicio
const query = this.articuloRepo.createQueryBuilder('articulo')
  .leftJoinAndSelect('articulo.grupo', 'grupo')
  .leftJoinAndSelect('grupo.sector', 'sector');

// Si tiene ALL_READ/ALL_WRITE → sin filtro
// Si no → filtra por sector type basado en permisos

if (!hasAllPermissions && allowedSectorTypes.length > 0) {
  query.andWhere('sector.tipo IN (:sectorTypes)', { 
    sectorTypes: allowedSectorTypes 
  });
}

// Ana ve artículos de:
// - almacen-taller (tiene permisos TALLER)
// - almacen-comun (tiene permisos COMUN)
```

### 4. Respuesta del API

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "cod": "ART-001",
        "nombre": "Filtro Aceite",
        "grupo": { "sector": { "tipo": "almacen-taller" } }
      },
      {
        "cod": "ART-005",
        "nombre": "Tuerca M10",
        "grupo": { "sector": { "tipo": "almacen-comun" } }
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "message": "2 artículos encontrados"
}
```

## Guards (Decoradores de Seguridad)

### 1. Auth Guard
```typescript
@Auth() // Verifica JWT válido
@Auth(ValidRoles.admin) // Verifica rol específico
```

### 2. UserValidRoleGuard
```typescript
// Verifica que usuario tenga al menos uno de los roles requeridos
if (validRoles.includes(user.rol.rol))  // ← Ahora: user.roles.some(r => validRoles.includes(r.rol))
```

### 3. AlmacenPermissionsGuard
```typescript
@AlmacenPermissions(
  Permisos.ALMACEN_TALLER_WRITE,
  Permisos.ALL_WRITE
)
// Verifica que usuario tenga al menos uno de los permisos requeridos
```

## Flujo de Petición HTTP

```
GET /almacen/articulos?page=1&pageSize=10
Authorization: Bearer eyJhbGc...

                    ↓

@Auth() → Verifica JWT válido

                    ↓

JwtAccessStrategy.validate()
├─ Busca usuario por email
├─ Carga relación: roles
└─ Retorna user con roles[]

                    ↓

AlmacenController.getAllArticles(page, pageSize, user)
├─ Extrae permisos: user.roles.flatMap(r => r.permisos)
└─ Pasa a servicio

                    ↓

AlmacenService.getAllArticles(page, pageSize, userPermissions)
├─ Crea QueryBuilder
├─ Si permisos = [ALL_READ] → sin filtro
├─ Si no → filtra por sector.tipo
└─ Retorna artículos

                    ↓

Respuesta JSON con artículos visibles
```

## Ejemplos de Asignación de Permisos

### Opción 1: Usuario Básico (Lectura Almacén Taller)
```sql
INSERT INTO usuario_rol (dni, rol_id) VALUES (12345678, 1);
-- Usuario puede ver artículos almacen-taller solamente
```

### Opción 2: Superuser Doble Área
```sql
INSERT INTO usuario_rol (dni, rol_id) VALUES 
(88888888, 3),  -- almacen-taller:read, almacen-taller:write
(88888888, 5);  -- almacen-comun:read, almacen-comun:write
-- Usuario puede leer/escribir en ambas áreas
```

### Opción 3: Admin Total
```sql
INSERT INTO usuario_rol (dni, rol_id) VALUES 
(99999999, 11), -- all:read
(99999999, 12); -- all:write
-- Usuario tiene acceso total al sistema
```

## Documentación Relacionada

| Documento | Contenido |
|-----------|----------|
| `MANY_TO_MANY_ROLES_IMPLEMENTATION.md` | Detalles técnicos de relación N:N |
| `NUEVOS_ROLES_GUIA.md` | Guía para crear nuevos roles |
| `RESUMEN_IMPLEMENTACION_NN.md` | Resumen ejecutivo de cambios |
| `PERMISSION_FILTERING_IMPLEMENTATION.md` | Detalles de filtrado de artículos |
| `ALMACEN_MODULE_ARCHITECTURE.md` | Arquitectura del módulo almacén |
| `GUARDS_AND_DECORATORS.md` | Detalles de guards y decoradores |

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests del módulo almacén
npm run test -- src/almacen

# Type checking
npm run typecheck

# Build
npm run build
```

### Cobertura Actual
- ✅ Almacén Service: 7 tests
- ✅ Almacén Controller: 3 tests
- ✅ Total: 10/10 tests passing
- ✅ TypeScript: 0 errores

## Mejores Prácticas

### 1. Al Crear Nuevo Endpoint
```typescript
@Get('mi-endpoint')
@Auth(ValidRoles.admin)  // Verificar rol
@UseGuards(AlmacenPermissionsGuard)
@AlmacenPermissions(Permisos.ALMACEN_TALLER_READ)  // Verificar permiso
async miEndpoint(@GetUser() user: Usuario) {
  // Los permisos del usuario ya están validados
  const permissions = user.roles.flatMap(r => r.permisos);
}
```

### 2. Al Filtrar Datos
```typescript
// Combinar permisos de múltiples roles
const userPermissions = user.roles.flatMap(r => r.permisos);

// Verificar si tiene ALL_READ
const hasAllAccess = userPermissions.includes(Permisos.ALL_READ);

// Si no, filtrar según sector
if (!hasAllAccess) {
  const allowedTypes = this.mapPermissionsToSectors(userPermissions);
  query.andWhere('sector.tipo IN (:types)', { types: allowedTypes });
}
```

### 3. En Tests
```typescript
const mockUser = {
  roles: [
    { id: 3, rol: 'superuser', permisos: [...] },
    { id: 5, rol: 'superuser', permisos: [...] }
  ]
};
```

## Troubleshooting

### "User roles not found"
- Verifica que usuario tenga al menos un rol en `usuario_rol`
- Comprueba que la relación está siendo cargada: `relations: ['roles']`

### Usuario no ve artículos esperados
- Verifica permisos del rol en tabla `rol.permisos`
- Verifica que artículos tienen `sector.tipo` correcto
- Verifica que el filtrado se está ejecutando en servicio

### Type errors con `user.roles`
- Asegúrate de usar `user.roles` (plural), no `user.rol`
- Verifica que la entidad Usuario está actualizada

## Performance

- **Eager Loading**: `roles` se cargan automáticamente con usuario (sin queries extra)
- **Database Filtering**: QueryBuilder filtra a nivel BD (no en aplicación)
- **Permutation Caching**: Considera cachear combinaciones de permisos en futuro

---

**Última actualización**: 29 de enero de 2026
**Estado**: ✅ Producción
**Versión**: N:N con permisos combinados
