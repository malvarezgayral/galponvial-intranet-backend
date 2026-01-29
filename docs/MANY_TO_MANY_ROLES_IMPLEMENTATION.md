# Many-to-Many (N:N) User-Role Relationship Implementation

## Overview
Implemented a Many-to-Many relationship between **Usuario** (User) and **Rol** (Role) entities, allowing users to have multiple roles simultaneously. This provides superior flexibility over the previous one-to-one relationship.

## Key Changes

### 1. Entity Relationships

#### Before (One-to-One)
```typescript
// Usuario
@ManyToOne(() => Rol, (rol) => rol.usuarios)
@JoinColumn({ name: 'rol_id' })
rol: Rol;

// Rol
@OneToMany(() => Usuario, (usuario) => usuario.rol)
usuarios: Usuario[];
```

#### After (Many-to-Many)
```typescript
// Usuario
@ManyToMany(() => Rol, (rol) => rol.usuarios, { nullable: true, eager: true })
@JoinTable({
  name: 'usuario_rol',
  joinColumn: { name: 'dni', referencedColumnName: 'dni' },
  inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
})
roles: Rol[];

// Rol
@ManyToMany(() => Usuario, (usuario) => usuario.roles)
usuarios: Usuario[];
```

**Benefits of N:N relationship:**
- Users can have multiple roles in a single query
- Roles can be assigned to many users
- More flexible permission combinations
- No need to create new roles for every combination
- Supports hierarchical role structures

### 2. Database Schema

**New Join Table**: `usuario_rol`
```sql
CREATE TABLE usuario_rol (
  dni BIGINT NOT NULL,
  rol_id INT NOT NULL,
  PRIMARY KEY (dni, rol_id),
  FOREIGN KEY (dni) REFERENCES usuario(dni),
  FOREIGN KEY (rol_id) REFERENCES rol(id)
);
```

**Updated usuario table**:
```sql
-- rol_id FOREIGN KEY column removed
ALTER TABLE usuario DROP COLUMN rol_id;
```

### 3. Seed Data Files

#### `src/seed/data/usuarios.csv` (Updated)
```csv
dni,nombre,apellido,email,password,isActive,tokenVersion,fecha_alta,fecha_baja
12345678,Juan,Pérez,juan.perez@galpelvial.com,eljovEnquenunc4fue,false,0,2023-01-15,
87654321,María,García,maria.garcia@galpelvial.com,eljovEnquenunc4fue,false,0,2023-02-20,
11223344,Carlos,López,carlos.lopez@galpelvial.com,eljovEnquenunc4fue,false,0,2023-03-10,2024-06-30
55667788,Ana,Martínez,ana.martinez@galpelvial.com,eljovEnquenunc4fue,true,0,2023-04-05,
```
*Note: Removed `rol_id` column - roles are now managed via join table*

#### `src/seed/data/usuario_rol.csv` (New)
```csv
dni,rol_id
12345678,1
87654321,2
11223344,1
55667788,3
```
*Maps users to roles via the join table*

### 4. Permission Extraction Logic

All components that previously accessed `user.rol` have been updated to work with multiple roles:

**Pattern Used:**
```typescript
// Extract permissions from all roles and combine them
const userRoles = user.roles ?? [];
const userPermissions: Permisos[] = userRoles.flatMap(
  (role) => role.permisos ?? [],
);
```

**Affected Components:**
1. **AlmacenController** - Combines permissions from all roles for article filtering
2. **AlmacenPermissionsGuard** - Checks if user has required permission across any role
3. **UserValidRoleGuard** - Verifies user has at least one required role
4. **JwtAccessStrategy** - Loads all user roles when validating JWT token
5. **UsuarioService** - All user queries now load `roles` relationship

### 5. Use Cases & Examples

#### Scenario 1: User with Single Role
**User**: Juan Pérez (dni: 12345678)
**Role**: user (rol_id: 1)
**Permissions**: `almacen-taller:read`

Database entries:
```
usuario: (12345678, Juan, ..., isActive: false)
usuario_rol: (12345678, 1)
rol: (1, user, ['almacen-taller:read'])
```

#### Scenario 2: Superuser with Multiple Roles
**User**: Ana Martínez (dni: 55667788)
**Roles**: 
- superuser_taller (rol_id: 3) → `almacen-taller:read, almacen-taller:write`
- superuser_comun (rol_id: 5) → `almacen-comun:read, almacen-comun:write`

Database entries:
```
usuario: (55667788, Ana, ..., isActive: true)
usuario_rol: (55667788, 3), (55667788, 5)
rol: (3, superuser, ['almacen-taller:read', 'almacen-taller:write'])
rol: (5, superuser, ['almacen-comun:read', 'almacen-comun:write'])
```

Combined permissions: `almacen-taller:read, almacen-taller:write, almacen-comun:read, almacen-comun:write`

#### Scenario 3: Admin with All Access
**User**: Carlos López (dni: 11223344)
**Roles**:
- superuser (rol_id: 3) → all almacen permissions
- admin (rol_id: 12) → `all:read, all:write`

Combined permissions give full system access.

### 6. Available Roles (Reference)

| ID | Role Name | Permissions | Use Case |
|---|-----------|------------|----------|
| 1 | user | `almacen-taller:read` | Basic warehouse staff |
| 2 | user | `almacen-comun:read` | Common warehouse access |
| 3 | superuser | `almacen-taller:read, almacen-taller:write` | Taller manager |
| 4 | superuser | `almacen-taller:write` | Taller write-only |
| 5 | superuser | `almacen-comun:read, almacen-comun:write` | Common area manager |
| 6 | superuser | `almacen-comun:write` | Common area write-only |
| 7 | admin | `almacen-taller:read` | Admin with taller visibility |
| 8 | admin | `almacen-taller:write` | Admin taller operations |
| 9 | admin | `almacen-comun:read` | Admin common area visibility |
| 10 | admin | `almacen-comun:write` | Admin common area operations |
| 11 | admin | `all:read` | Read-only admin access |
| 12 | admin | `all:write` | Full admin access |

### 7. Assigning Multiple Roles to a User

**Method 1: Direct Database Query**
```sql
-- Assign roles 3 and 5 to user 55667788 (Ana)
INSERT INTO usuario_rol (dni, rol_id) VALUES (55667788, 3);
INSERT INTO usuario_rol (dni, rol_id) VALUES (55667788, 5);
```

**Method 2: Seed CSV File**
Update `usuario_rol.csv`:
```csv
dni,rol_id
55667788,3
55667788,5
```

**Method 3: Future API Endpoint** (not yet implemented)
```
PUT /usuario/55667788/roles
{
  "roleIds": [3, 5]
}
```

### 8. Testing

All unit tests have been updated to use the new `roles` array:

**Before:**
```typescript
const mockUser = {
  rol: { id: 1, rol: 'user', permisos: [...] }
};
```

**After:**
```typescript
const mockUser = {
  roles: [
    { id: 1, rol: 'user', permisos: [...] },
    { id: 3, rol: 'superuser', permisos: [...] }
  ]
};
```

**Test Results**: ✅ All 10 almacen module tests passing

### 9. Permission Combination Rules

When a user has multiple roles, their effective permissions are the **union** of all role permissions:

```typescript
User Roles: [role_3, role_5]
  ├─ role_3 permissions: ['almacen-taller:read', 'almacen-taller:write']
  └─ role_5 permissions: ['almacen-comun:read', 'almacen-comun:write']

Effective permissions: ['almacen-taller:read', 'almacen-taller:write', 'almacen-comun:read', 'almacen-comun:write']
```

### 10. Migration Path (for existing deployments)

If migrating from 1:1 to N:N relationship:

1. Create `usuario_rol` join table
2. Migrate existing `usuario.rol_id` → `usuario_rol.dni, usuario_rol.rol_id`
3. Drop `usuario.rol_id` column
4. Update all code references from `user.rol` → `user.roles`
5. Test thoroughly with multiple roles assigned to test users

**Migration SQL:**
```sql
-- Create join table
CREATE TABLE usuario_rol (
  dni BIGINT NOT NULL,
  rol_id INT NOT NULL,
  PRIMARY KEY (dni, rol_id),
  FOREIGN KEY (dni) REFERENCES usuario(dni),
  FOREIGN KEY (rol_id) REFERENCES rol(id)
);

-- Migrate data
INSERT INTO usuario_rol (dni, rol_id)
SELECT dni, rol_id FROM usuario WHERE rol_id IS NOT NULL;

-- Drop old column
ALTER TABLE usuario DROP COLUMN rol_id;
```

### 11. Performance Considerations

- **Eager Loading**: `eager: true` on `@ManyToMany` decorator ensures roles are loaded automatically with users
- **Query Optimization**: Join table allows efficient filtering by multiple roles
- **Caching**: Could be added for frequently accessed role combinations
- **Lazy Loading Option**: Can be changed to `lazy: true` if N:N becomes a bottleneck

### 12. Future Enhancements

1. **Role Hierarchy**: Implement parent-child role relationships
2. **Dynamic Role Assignment API**: Endpoint to assign/remove roles from users
3. **Time-Based Roles**: Roles with start/end dates
4. **Permission Override**: Allow specific permission grants/denials per user
5. **Role Templates**: Pre-configured role combinations for common scenarios
6. **Audit Trail**: Log role assignment changes for compliance

### 13. Troubleshooting

**Issue**: "User roles not found" error
- **Solution**: Ensure user has at least one role assigned in `usuario_rol` table

**Issue**: Permissions not working as expected
- **Solution**: Verify roles have correct permissions in `rol.permisos` array

**Issue**: Roles not loading for user
- **Solution**: Check that `roles` relation is included in TypeORM query:
  ```typescript
  .leftJoinAndSelect('usuario.roles', 'roles')
  // OR in find options:
  relations: ['roles']
  ```

**Issue**: User can't see articles they should have access to
- **Solution**: Check:
  1. User is assigned correct roles in `usuario_rol`
  2. Roles have correct permissions
  3. Articles have correct sector types assigned
  4. Filtering logic includes user's combined permissions

---

**Last Updated**: 29 de enero de 2026
**Status**: ✅ Implemented and Tested
**Breaking Change**: Yes - requires data migration for existing deployments
