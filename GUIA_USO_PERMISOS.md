# Guía de Uso del Sistema de Permisos de Almacén

## Conceptos Clave

### Jerarquía de Relaciones
```
Usuario
    ↓
Rol (contiene lista de Permisos)
    ↓
Permisos (ej: almacen-taller:write, almacen-comun:read)
    ↓
Artículo → Grupo Artículo → Sector Galpón → Tipo de Sector
```

### Tipos de Sectores
- **almacen-taller**: Área para repuestos y componentes técnicos
- **almacen-comun**: Área para artículos comunes, limpieza, etc.

### Niveles de Permisos
- `:read` - Lectura/visualización
- `:write` - Escritura, edición, eliminación

## Ejemplos Prácticos

### 1. Crear un Usuario "Almacenero de Taller"

```csv
dni,nombre,apellido,email,password,isActive,tokenVersion,fecha_alta,fecha_baja,rol_id
12345678,Juan,Pérez,juan.perez@company.com,securepass123,true,0,2024-01-15,,1
```

**Permisos asociados (en roles.csv)**:
```csv
id,rol,permisos
1,user,almacen-taller:read
2,user,almacen-taller:write  # Usar rol_id=2 para tener write
```

**Acciones permitidas**:
- ✅ Ver artículos del almacén-taller
- ✅ Crear/editar/eliminar artículos del almacén-taller
- ❌ Ver artículos del almacén-común
- ❌ Crear/editar artículos del almacén-común

### 2. Crear un Superusuario con Acceso Total

```csv
dni,nombre,apellido,email,password,isActive,tokenVersion,fecha_alta,fecha_baja,rol_id
87654321,María,García,maria.garcia@company.com,securepass123,true,0,2023-02-20,,5
```

**Permisos (en roles.csv)**:
```csv
id,rol,permisos
3,superuser,almacen-taller:read
4,superuser,almacen-taller:write
5,superuser,almacen-comun:read
6,superuser,almacen-comun:write
7,superuser,all:read
8,superuser,all:write
```

**Acciones permitidas**:
- ✅ Acceso total a ambas áreas
- ✅ Crear/editar/eliminar en cualquier área
- ✅ Ver reportes globales

### 3. Crear un Admin del Sistema

```csv
dni,nombre,apellido,email,password,isActive,tokenVersion,fecha_alta,fecha_baja,rol_id
11223344,Carlos,López,carlos.lopez@company.com,securepass123,true,0,2023-03-10,,11
```

**Permisos (en roles.csv)**:
```csv
id,rol,permisos
11,admin,almacen-taller:read
12,admin,almacen-taller:write
13,admin,almacen-comun:read
14,admin,almacen-comun:write
15,admin,all:read
16,admin,all:write
```

## Flujo de Una Operación

### Escenario: Juan (user, almacen-taller) intenta crear un artículo

```
1. Juan se autentica
   ↓ (Obtiene JWT token)
   
2. POST /almacen/articulos
   {
     "nombre": "Pastillas de freno",
     "modelo": "PF-100",
     "descripcion": "Pastillas cerámicas",
     "grupo_id": 1,        ← Pertenece al almacén-taller
     "unidad_tipo": "caja",
     "stock": 10
   }
   ↓
   
3. JwtAuthGuard
   ✅ Token válido
   ↓
   
4. UserValidRoleGuard
   ✅ Rol = "user" (permitido)
   ↓
   
5. AlmacenPermissionsGuard
   ✅ Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
   ✅ Juan tiene: almacen-taller:write
   ✓ Coinciden! → Operación permitida
   ↓
   
6. Artículo creado exitosamente
```

### Escenario: Juan intenta crear un artículo en almacén-común

```
Grupo_id: 2 (almacén-común, no taller)
   ↓
5. AlmacenPermissionsGuard
   ✅ Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
   ❌ Juan tiene: almacen-taller:write
   ✗ No coincide → 403 Forbidden
   
"User Juan does not have required permissions: almacen-taller:write, almacen-comun:write, all:write"
```

## Estructura de Datos

### Ejemplo de Sectores Galpón

```csv
id,nro_sector,tipo,descripcion
1,1,almacen-taller,repuestos de automotores
2,2,almacen-comun,articulos de limpieza
3,3,almacen-comun,articulos de cocina
4,4,almacen-taller,materiales oxidables
5,5,almacen-comun,utensilios varios
```

### Ejemplo de Grupos Artículo

```csv
id,nombre,descripcion,ubicacion
1,Repuestos,Repuestos para vehículos,1    ← Sector 1 (almacén-taller)
2,Neumaticos,Neumáticos y llantas,2      ← Sector 2 (almacén-común)
3,Combustibles,Combustibles y lubricantes,4  ← Sector 4 (almacén-taller)
4,Herramientas,Herramientas,3            ← Sector 3 (almacén-común)
```

### Ejemplo de Artículos

```csv
nombre,modelo,descripcion,stock,unidad_tipo,grupo_id,cod_proveedor,unidad_medida_id
Filtro de aire,FA-100,Filtro de aire,3,pieza,1,PROV-FA-100,
Pastillas de freno,PF-200,Pastillas cerámicas,6,caja,1,PROV-PF-200,2
Neumático 11R22,NE-300,Neumático para camión,9,pieza,2,PROV-NE-300,
```

## API Endpoints Protegidos

### Crear Artículo
```
POST /almacen/articulos
Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
```

### Actualizar Artículo
```
PUT /almacen/articulos/:cod
Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
```

### Eliminar Artículo
```
DELETE /almacen/articulos/:cod
Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
```

### Crear Grupo
```
POST /almacen/grupos
Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
```

### Actualizar Grupo
```
PUT /almacen/grupos/:id
Permisos requeridos: [almacen-taller:write, almacen-comun:write, all:write]
```

## Endpoints No Protegidos

### Lectura (No requieren permisos específicos)
```
GET /almacen/articulos          (requiere autenticación)
GET /almacen/grupos             (requiere autenticación)
GET /almacen/grupos/:id         (requiere autenticación)
GET /almacen/movimientos/:id    (requiere autenticación)
```

## Asignación de Roles Recomendada

### Para Pequeñas Empresas
- **1 Admin**: rol_id = 11+ (acceso total)
- **2-3 Usuarios**: rol_id = 1 o 2 (almacén-taller)

### Para Medianas Empresas
- **1 Admin**: rol_id = 11+ (acceso total)
- **1 Superusuario**: rol_id = 5+ (acceso supervisión)
- **N Usuarios Taller**: rol_id = 1-2 (almacén-taller)
- **N Usuarios Común**: rol_id = 2 (almacén-común)

### Para Grandes Empresas
- **1 Superadmin**: Acceso total del sistema
- **2-3 Admins Almacén**: rol_id = 11+ (gestión de almacén)
- **Supervisores**: rol_id = 5-8 (múltiples áreas)
- **Operarios**: rol_id = 1-2 (área específica)

## Troubleshooting

### Error: "User does not have required permissions"
**Causa**: El usuario no tiene los permisos necesarios
**Solución**: Verificar rol_id del usuario y actualizarlo en la BD

### Error: "User role not found"
**Causa**: El usuario no tiene rol asignado
**Solución**: Asignar rol_id válido en tabla usuarios

### Error: "Token expired"
**Causa**: JWT token expirado
**Solución**: Reauthenticar con nuevas credenciales

### Error: "Article has no sector associated"
**Causa**: El artículo no tiene grupo, o el grupo no tiene sector
**Solución**: Verificar integridad de datos en grupos_articulo
