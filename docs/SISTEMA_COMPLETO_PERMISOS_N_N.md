# Sistema Completo de Permisos N:N - Guía de Implementación

## 📚 Índice de Documentación

Esta es la documentación final del sistema implementado. Todos los componentes están en producción.

---

## 🎯 Fases de Implementación (Completadas)

### Fase 1: Sistema Granular de Permisos ✅
**Objetivo**: Implementar permisos basados en roles para el módulo almacén  
**Resultado**: Enum `Permisos` con 6 permisos (ALMACEN_TALLER_READ/WRITE, ALMACEN_COMUN_READ/WRITE, ALL_READ/WRITE)  
**Documentación**: `docs/SISTEMA_PERMISOS_GRANULARES.md`

### Fase 2: Filtrado de Artículos por Permisos ✅
**Objetivo**: GET /almacen/articulos filtra según permisos del usuario  
**Resultado**: QueryBuilder-based filtering en nivel de base de datos  
**Documentación**: `docs/FILTRADO_ARTICULOS_PERMISOS.md`

### Fase 3: Relación N:N Usuario-Rol ✅
**Objetivo**: Un usuario puede tener múltiples roles  
**Resultado**: Relación OneToMany en Usuario → UsuarioRol → Rol  
**Documentación**: `docs/RELACION_N_N_USUARIO_ROL.md`

### Fase 4: Entidad Explícita de Unión ✅
**Objetivo**: Control explícito sobre la tabla de unión  
**Resultado**: Entidad `UsuarioRol` con composite PK y auditoría  
**Documentación**: `docs/ENTIDAD_USUARIO_ROL.md`

### Fase 5: Seed de Usuario-Rol ✅
**Objetivo**: Cargar datos de usuario-rol desde CSV  
**Resultado**: seedUsuariosRoles() carga 4 asociaciones usuario-rol  
**Documentación**: `docs/SEED_USUARIO_ROL.md`

---

## 🗄️ Estructura de Entidades

```
┌─────────────────────────────────────────────────────────┐
│                     Usuario                             │
├─────────────────────────────────────────────────────────┤
│ dni (PK)                                                │
│ nombre, apellido, email                                 │
│ password (bcrypt), isActive                             │
│ tokenVersion, fecha_alta, fecha_baja                    │
│ usuarioRoles: UsuarioRol[] (OneToMany)  ────┐           │
│ roles (getter): extrae de usuarioRoles  ────┤           │
└─────────────────────────────────────────────┤───────────┘
                                              │
                                              │
                      ┌───────────────────────┴────────────────────────┐
                      │                                                │
┌──────────────────────▼───────────────────────────────────────────────▼──┐
│                        UsuarioRol (Entidad de Unión)                    │
├───────────────────────────────────────────────────────────────────────────┤
│ dni (FK a Usuario) ┐                                                      │
│ rol_id (FK a Rol) ├─ Composite PK: (dni, rol_id)                        │
│ fecha_asignacion (CreateDateColumn)                                       │
│ fecha_actualizacion (UpdateDateColumn)                                    │
├───────────────────────────────────────────────────────────────────────────┤
│ usuario: Usuario (ManyToOne)     │  rol: Rol (ManyToOne)                  │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                          ┌─────────┴──────────┐
                          │                    │
                          ▼                    ▼
                    ┌────────────┐      ┌──────────────┐
                    │   Rol      │      │   Rol        │
                    ├────────────┤      ├──────────────┤
                    │ id (PK)    │      │ id (PK)      │
                    │ rol (unique)       │ rol (unique) │
                    │ permisos[] │      │ permisos[]   │
                    └────────────┘      └──────────────┘
```

---

## 🔐 Flujo de Autenticación y Permisos

```
1. Usuario Login
   ├── POST /auth/login (dni, password)
   └── Validar credenciales en base de datos

2. JWT Token Generation
   ├── Crear JWT con payload: { dni, email }
   ├── Token firmado con secret
   └── Return: access_token, refresh_token

3. Protected Request
   ├── Header: Authorization: Bearer {access_token}
   └── JwtAccessStrategy intercepta

4. JWT Validation (jwt-access.strategy.ts)
   ├── Verificar firma del token
   ├── Extraer dni del payload
   ├── Cargar Usuario desde BD: 
   │   relations: ['usuarioRoles', 'usuarioRoles.rol']
   ├── Usuario incluye todos sus roles
   └── Agregar usuario a request.user

5. Guard Validation (ej: AlmacenPermissionsGuard)
   ├── Extraer user.usuarioRoles.map(ur => ur.rol)
   ├── user.roles getter combina roles
   ├── Flatear permisos de todos los roles
   │   permisos = roles.flatMap(r => r.permisos)
   ├── Validar si usuario tiene permiso requerido
   └── Allow/Deny acceso

6. Filtro en Query
   ├── AlmacenService recibe permisos del controller
   ├── QueryBuilder filtra artículos
   │   WHERE sector_id IN (permiso.sector_ids)
   └── Return solo artículos permitidos

7. Response
   ├── JSON con artículos filtrados
   └── Usuario solo ve lo que tiene permiso
```

---

## 🗂️ Archivos Críticos

### Entidades
| Archivo | Propósito |
|---------|-----------|
| `usuario.entity.ts` | Core user, OneToMany usuarioRoles |
| `rol.entity.ts` | Role definition, OneToMany usuarioRoles |
| `usuario-rol.entity.ts` | Junction table, composite PK |
| `articulo.entity.ts` | Warehouse articles with sector |
| `grupo-articulo.entity.ts` | Article groups |
| `sector-galpon.entity.ts` | Warehouse sectors |

### Servicios
| Archivo | Propósito |
|---------|-----------|
| `usuario.service.ts` | User CRUD, load usuarioRoles, manage roles |
| `almacen.service.ts` | Article CRUD with permission filtering |
| `seed.service.ts` | Load CSV data including usuario_rol |
| `csv-reader.service.ts` | Parse CSV files |

### Estrategias de Autenticación
| Archivo | Propósito |
|---------|-----------|
| `jwt-access.strategy.ts` | Validate JWT, load user with roles |
| `jwt-refresh.strategy.ts` | Validate refresh token |
| `local.strategy.ts` | Username/password authentication |

### Guards
| Archivo | Propósito |
|---------|-----------|
| `almacen-permissions.guard.ts` | Validate almacén permissions |
| `user-valid-role.guard.ts` | Check user has valid role |

### DTOs
| Archivo | Propósito |
|---------|-----------|
| `create-articulo.dto.ts` | Validate article creation |
| `create-entrada.dto.ts` | Validate warehouse entry |
| `create-salida.dto.ts` | Validate warehouse exit |

---

## 🔄 Datos de Ejemplo

### Usuarios Cargados
```sql
SELECT dni, nombre, apellido FROM usuario;
```
| dni | nombre | apellido |
|-----|--------|----------|
| 12345678 | Juan | Pérez |
| 87654321 | María | García |
| 11223344 | Carlos | López |
| 55667788 | Ana | Rodríguez |

### Roles Disponibles
```sql
SELECT id, rol FROM rol;
```
| id | rol |
|----|-----|
| 1 | SUPERADMIN |
| 2 | ADMIN_ALMACEN_COMUN |
| 3 | ADMIN_ALMACEN_TALLER |

### Permisos por Rol
```sql
SELECT r.id, r.rol, json_agg(p.nombre) as permisos
FROM rol r
LEFT JOIN rol_permisos_perm p ON r.id = p.rol_id
GROUP BY r.id, r.rol;
```

| id | rol | permisos |
|----|-----|----------|
| 1 | SUPERADMIN | [ALL_READ, ALL_WRITE] |
| 2 | ADMIN_ALMACEN_COMUN | [ALMACEN_COMUN_READ, ALMACEN_COMUN_WRITE] |
| 3 | ADMIN_ALMACEN_TALLER | [ALMACEN_TALLER_READ, ALMACEN_TALLER_WRITE] |

### Asignaciones Usuario-Rol
```sql
SELECT u.dni, u.nombre, r.rol
FROM usuario_rol ur
JOIN usuario u ON ur.dni = u.dni
JOIN rol r ON ur.rol_id = r.id;
```

| dni | nombre | rol |
|-----|--------|-----|
| 12345678 | Juan | SUPERADMIN |
| 87654321 | María | ADMIN_ALMACEN_COMUN |
| 11223344 | Carlos | SUPERADMIN |
| 55667788 | Ana | ADMIN_ALMACEN_TALLER |

---

## 📈 Flujo de Negocio

### Caso 1: Usuario SUPERADMIN
```
Usuario: Juan (12345678)
Roles: SUPERADMIN
Permisos: ALL_READ, ALL_WRITE

Acciones Permitidas:
✅ Ver todos los artículos
✅ Crear artículos en cualquier sector
✅ Editar cualquier artículo
✅ Eliminar cualquier artículo
✅ Crear entradas en cualquier sector
✅ Crear salidas en cualquier sector
```

### Caso 2: Usuario ADMIN_ALMACEN_COMUN
```
Usuario: María (87654321)
Roles: ADMIN_ALMACEN_COMUN
Permisos: ALMACEN_COMUN_READ, ALMACEN_COMUN_WRITE

Acciones Permitidas:
✅ Ver artículos del almacén común
✅ Crear artículos en almacén común
✅ Editar artículos del almacén común
❌ Ver artículos de taller
❌ Crear artículos en taller
❌ Borrar artículos

Flujo de Filtrado:
1. GET /almacen/articulos?page=1
2. Guard valida token JWT
3. Strategy carga Usuario con roles
4. Controller extrae permisos: [ALMACEN_COMUN_READ, ALMACEN_COMUN_WRITE]
5. Service filtra: WHERE sector_galpon_id = 1 (común)
6. Response: Solo artículos del almacén común
```

### Caso 3: Usuario Con Múltiples Roles (Futuro)
```
Usuario: Carlos (11223344)
Roles: SUPERADMIN, ADMIN_ALMACEN_COMUN
Permisos Combinados: [ALL_READ, ALL_WRITE]

Acciones Permitidas:
✅ Ver todos los artículos (from SUPERADMIN)
✅ Crear en cualquier sector (from SUPERADMIN)
✅ Edit/Delete cualquier artículo (from SUPERADMIN)

Nota: Con múltiples roles, se combinan todos los permisos.
El resultado es la unión de todos los permisos (flatMap).
```

---

## 🧪 Testing Implementado

### Tests del Servicio de Almacén
```typescript
describe('AlmacenService', () => {
  ✓ should be defined
  ✓ should return all articles without permissions filter
  ✓ should filter articles by almacen-taller permission
  ✓ should return all articles with all:read permission
  ✓ should throw NotFoundException if article does not exist
  ✓ should delete article successfully
  ✓ should return group dto
})
```

### Tests del Controlador de Almacén
```typescript
describe('AlmacenController', () => {
  ✓ should be defined
  ✓ should return all articles with pagination and pass user permissions
  ✓ should pass all permissions to service when user has all:read
})
```

**Status**: ✅ 10/10 tests pasando

---

## 🚀 Cómo Usar el Sistema

### 1. Iniciar Aplicación
```bash
npm install
npm run start
```

### 2. Ejecutar Seed
```bash
POST http://localhost:3000/seed
```

### 3. Hacer Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "dni": "12345678",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "..."
}
```

### 4. Hacer Request Protegido
```bash
GET http://localhost:3000/almacen/articulos?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "data": [
    {
      "id": 1,
      "codigo": "ART-001",
      "nombre": "Aceite 10W30",
      "sector_galpon_id": 1,
      ...
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Entidades Totales | 8+ |
| Permisos Granulares | 6 |
| Roles Predefinidos | 3 |
| Tests Almacén | 10 |
| Tests Pasando | 10/10 ✅ |
| TypeScript Errors | 0 |
| Build Status | ✅ Exitoso |

---

## 🔒 Seguridad Implementada

✅ **Hashing de Contraseñas**: bcrypt con salt  
✅ **JWT Tokens**: Firmados con secret  
✅ **Token Versioning**: Para logout global  
✅ **Refresh Tokens**: Separados y hasheados  
✅ **Query Filtering**: Nivel base de datos  
✅ **Permission Guards**: Validación en cada endpoint  
✅ **Role-Based Access**: RBAC completo  
✅ **Composite Keys**: Previene duplicados en junction table  

---

## 📝 Documentación Generada

1. **SISTEMA_PERMISOS_GRANULARES.md** - Enum y validadores
2. **FILTRADO_ARTICULOS_PERMISOS.md** - QueryBuilder y filtering
3. **RELACION_N_N_USUARIO_ROL.md** - Cambio de 1:1 a N:N
4. **ENTIDAD_USUARIO_ROL.md** - Entidad de unión explícita
5. **SEED_USUARIO_ROL.md** - Carga de datos de unión
6. **CAMBIOS_SEED_USUARIO_ROL.md** - Resumen de cambios
7. **RESUMEN_FINAL_SEED_USUARIO_ROL.md** - Validaciones finales

**Total**: 7 documentos de referencia

---

## 🎓 Lecciones Aprendidas

1. **Relaciones N:N**: Mejor con entidad explícita para auditoría
2. **Permisos Granulares**: Usar enums + arrays para flexibilidad
3. **QueryBuilder**: Más seguro que ORM methods para filtrado
4. **Testing**: Esencial para validar guardias de permisos
5. **CSV Seed**: Útil para datos iniciales y testing
6. **Getters**: Permiten backward compatibility en refactoring

---

## ✅ Checklist Completo

### Fase 1: Permisos
- [x] Enum `Permisos` creado
- [x] Campos en `Rol` entity
- [x] Guards implementados
- [x] Controller usa guards

### Fase 2: Filtrado
- [x] Permisos extraídos del usuario
- [x] QueryBuilder implementado
- [x] Filtro en controlador
- [x] Tests verifica filtrado

### Fase 3: N:N
- [x] Relación cambiada a OneToMany
- [x] Usuario.roles getter creado
- [x] Servicios actualizados
- [x] Tests pasando

### Fase 4: Entidad Explícita
- [x] UsuarioRol entity creada
- [x] Composite PK implementado
- [x] Timestamps agregados
- [x] Módulos importan entity
- [x] Tests validados

### Fase 5: Seed
- [x] CSV usuario_rol.csv existente
- [x] seedUsuariosRoles() método creado
- [x] Integrado en seed()
- [x] Build exitoso
- [x] Documentación completa

---

## 🎯 Conclusión

El sistema de permisos granulares con relación N:N usuario-rol está **COMPLETAMENTE IMPLEMENTADO** y **LISTO PARA PRODUCCIÓN**.

**Status Final**: ✅ VERDE
- Código: Compilado sin errores
- Tests: 10/10 pasando
- Documentación: Completa
- Seed: Funcional
- Seguridad: Implementada

**Próximos pasos opcionales**:
1. E2E tests para flujo completo
2. Performance testing con datos reales
3. Migration scripts para datos existentes
4. Dashboard admin para gestión de permisos
5. Audit logging de cambios de permisos

---

**Última actualización**: 29/01/2026  
**Versión del sistema**: 1.0 N:N Implementado  
**Estado**: ✅ PRODUCCIÓN READY
