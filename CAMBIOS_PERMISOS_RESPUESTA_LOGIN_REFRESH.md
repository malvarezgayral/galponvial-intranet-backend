# Cambios en Respuesta de Login y Refresh

## Resumen
Se han agregado los permisos asociados al rol del usuario en las respuestas de **login** y **refresh token**, permitiendo que el cliente valide y gestione permisos directamente desde la respuesta de autenticación.

## Archivos Modificados

### 1. `src/usuario/interfaces/object-service-response.interface.ts`
**Cambio:** Se agregó el campo `permisos: string[]` a la interfaz `JwtLoginResponse`

**Estructura anterior:**
```typescript
export interface JwtLoginResponse {
  dni: number;
  email: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
  tokenVersion: number;
}
```

**Estructura nueva:**
```typescript
export interface JwtLoginResponse {
  dni: number;
  email: string;
  rol: string;
  permisos: string[];           // ← NUEVO
  accessToken: string;
  refreshToken: string;
  tokenVersion: number;
}
```

### 2. `src/usuario/services/usuario.service.ts`
**Cambio 1 - Método `login()`:** Se extraen los permisos del rol del usuario y se incluyen en la respuesta

```typescript
// Extraer permisos del rol del usuario
const permisos = userWithRoles?.roles?.[0]?.permisos ?? [];

const jwtResponse: JwtLoginResponse = {
  dni: user.dni,
  email: user.email,
  rol: userWithRoles?.roles?.[0]?.rol ?? 'sin_rol',
  permisos,                    // ← NUEVO
  accessToken,
  refreshToken,
  tokenVersion: user.tokenVersion,
};
```

**Cambio 2 - Método `refreshToken()`:** Se actualizó para retornar también los permisos, rol y dni

**Estructura de retorno anterior:**
```typescript
Promise<ObjectServiceResponse<{ accessToken: string; tokenVersion: number }>>
```

**Estructura de retorno nueva:**
```typescript
Promise<ObjectServiceResponse<{
  accessToken: string;
  tokenVersion: number;
  permisos: string[];    // ← NUEVO
  rol: string;           // ← NUEVO
  dni: number;           // ← NUEVO
}>>
```

### 3. `src/usuario/controllers/usuario.controller.ts`
**Cambio:** Se actualizó la firma del método `refreshToken()` para reflejar el nuevo tipo de retorno

```typescript
@UseGuards(RefreshAuthGuard)
@Post('refresh')
refreshToken(
  @GetUser() user: Usuario,
): Promise<
  ObjectServiceResponse<{
    accessToken: string;
    tokenVersion: number;
    permisos: string[];    // ← NUEVO
    rol: string;           // ← NUEVO
    dni: number;           // ← NUEVO
  }>
> {
  return this.usuarioService.refreshToken(user.email);
}
```

## Ejemplos de Respuesta

### Login
```json
{
  "success": true,
  "data": {
    "dni": 12345678,
    "email": "usuario@example.com",
    "rol": "admin",
    "permisos": ["write", "read", "write-read"],
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenVersion": 0
  }
}
```

### Refresh Token
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenVersion": 0,
    "permisos": ["write", "read", "write-read"],
    "rol": "admin",
    "dni": 12345678
  },
  "message": "Token refreshed successfully"
}
```

## Beneficios

1. **Validación en cliente:** El cliente puede validar permisos sin necesidad de decodificar el JWT
2. **UX mejorada:** Se pueden mostrar/ocultar características según los permisos del usuario
3. **Consistencia:** Los permisos siempre están sincronizados con el backend
4. **Menos llamadas:** No es necesario hacer una llamada adicional para obtener los permisos
5. **Información completa:** El refresh token ahora devuelve también el rol y dni del usuario

## Notas Técnicas

- Los permisos se extraen del primer rol asignado al usuario (`user.roles?.[0]?.permisos`)
- Si el usuario no tiene rol asignado, se devuelve un array vacío de permisos
- El tipo de permisos sigue siendo `string[]` basado en el enum `Permisos` (write, read, write-read)
- Los cambios son retrocompatibles a nivel de estructura (solo se agregaron campos)
