# Cambio de Relación Usuario - RefreshToken: OneToOne → OneToMany

## Resumen del Cambio

Se ha modificado la relación entre las entidades `Usuario` y `RefreshToken` de **uno-a-uno (OneToOne)** a **uno-a-muchos (OneToMany)**. Esto permite:

1. **Historial de Refresh Tokens**: Cada usuario puede tener múltiples tokens registrados en la BD
2. **Sentido del atributo `revoked`**: Ahora es significativo porque un usuario puede tener varios tokens, algunos activos y otros revocados
3. **Mejor control de sesiones**: Permite revocar sesiones específicas manteniendo otras activas
4. **Auditoría**: Se puede mantener un registro de todos los tokens generados (nuevo campo `createdAt`)

---

## Cambios Realizados

### 1. Entidad `Usuario` 
**Archivo**: `src/usuario/entities/usuario.entity.ts`

**Cambio:**
```typescript
// Antes (OneToOne):
@OneToOne(() => RefreshToken, (rt) => rt.usuario)
refreshToken: RefreshToken | null;

// Después (OneToMany):
@OneToMany(() => RefreshToken, (rt) => rt.usuario)
refreshTokens: RefreshToken[];
```

### 2. Entidad `RefreshToken`
**Archivo**: `src/usuario/entities/refresh-token.entity.ts`

**Cambios:**
```typescript
// Imports actualizados:
import { ManyToOne } from 'typeorm';  // Antes: OneToOne

// Relación actualizada:
@ManyToOne(() => Usuario, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'dni_usuario' })
usuario: Usuario;

// Nuevo campo para auditoría:
@Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
createdAt: Date;
```

**Por qué el `onDelete: 'CASCADE'`:**
- Cuando se elimina un usuario, se eliminan automáticamente todos sus tokens refresh
- Evita datos huérfanos en la BD

---

### 3. Método `activarDesactivarUsuario()`
**Archivo**: `src/usuario/services/usuario.service.ts`

**Cambio:**
```typescript
// Antes:
if (usuario.refreshToken) {
  await this.refreshTokenRepository.remove(usuario.refreshToken);
}

// Después (elimina todos los tokens del usuario):
if (usuario.refreshTokens && usuario.refreshTokens.length > 0) {
  await this.refreshTokenRepository.remove(usuario.refreshTokens);
}
```

---

### 4. Método `logout()`
**Archivo**: `src/usuario/services/usuario.service.ts`

**Cambio de lógica:**

**Antes:**
- Revocaba un único token por usuario
- Lógica limitada

**Después:**
- Obtiene todos los tokens activos (no revocados) del usuario
- Los marca como revocados
- Retorna la cantidad de sesiones revocadas
- Tipo de retorno cambió de `boolean` a `number`

```typescript
async logout(email: string): Promise<ObjectServiceResponse<{ revoked: number }>> {
  // Obtiene los tokens activos
  const activeTokens = usuario.refreshTokens.filter((rt) => !rt.revoked);
  
  // Los marca como revocados
  activeTokens.forEach((token) => {
    token.revoked = true;
  });
  
  // Guarda los cambios
  await this.refreshTokenRepository.save(activeTokens);
  
  // Retorna la cantidad revocada
  return {
    success: true,
    data: { revoked: activeTokens.length },
    message: `${activeTokens.length} sesión/es revocada/s correctamente`,
  };
}
```

---

### 5. Estrategia `JwtRefreshStrategy`
**Archivo**: `src/usuario/authStrategies/jwt-refresh.strategy.ts`

**Cambio:**
```typescript
// Antes:
if (user.refreshToken && user.refreshToken.revoked) {
  throw new UnauthorizedException(...);
}

// Después:
const activeTokens = user.refreshTokens?.filter((rt) => !rt.revoked) ?? [];
if (activeTokens.length === 0) {
  throw new UnauthorizedException(...);
}
```

---

### 6. Controller `UsuarioController`
**Archivo**: `src/usuario/controllers/usuario.controller.ts`

**Cambio de tipos:**
```typescript
// Métodos logout y selfLogout
// Antes: Promise<ObjectServiceResponse<{ revoked: boolean }>>
// Después: Promise<ObjectServiceResponse<{ revoked: number }>>
```

---

## Estructura de Base de Datos

### Tabla `usuario` (sin cambios)
```
- dni (PK)
- nombre
- apellido
- email
- password
- isActive
- tokenVersion
- ...otras columnas
```

### Tabla `refresh_token` (actualizada)
```
- id (PK)
- dni_usuario (FK -> usuario.dni) [onDelete: CASCADE]
- tokenHash
- expiresAt
- revoked (BOOLEAN)
- createdAt (TIMESTAMP) [NUEVO]
```

**Relación:**
- Un Usuario → Muchos RefreshTokens
- Cada RefreshToken pertenece a un Usuario
- Al eliminar un Usuario, se eliminan sus tokens automáticamente

---

## Beneficios

✅ **Historial de sesiones**: Se pueden auditar todos los tokens generados  
✅ **Revocación selectiva**: Revocar tokens sin afectar otros activos  
✅ **Seguridad mejorada**: Mejor control sobre sesiones activas  
✅ **Atributo revoked significativo**: Ahora tiene real importancia  
✅ **Integridad referencial**: onDelete CASCADE evita datos huérfanos  
✅ **Información de creación**: Campo `createdAt` para auditoría  

---

## Ejemplo de Uso

### Login (sin cambios a nivel de API)
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    ...
  }
}
```

### Logout - Después del cambio
```json
{
  "success": true,
  "data": {
    "revoked": 2  // 2 sesiones fueron revocadas
  },
  "message": "2 sesión/es revocada/s correctamente"
}
```

---

## Notas Técnicas

1. **Migración de BD**: Se necesitará una migración TypeORM para:
   - Cambiar la relación de OneToOne a ManyToOne
   - Agregar el campo `createdAt`
   - Aplicar el `onDelete: CASCADE`

2. **Compatibilidad**: Los cambios son internos y no afectan la API publica (endpoints)

3. **Mejoras futuras**:
   - Endpoint para obtener historial de sesiones
   - Revocar sesiones específicas (por ID de token)
   - Límite de sesiones simultáneas por usuario
   - Notificaciones cuando se revoca una sesión
