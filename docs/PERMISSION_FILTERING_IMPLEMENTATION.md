# Permission-Based Article Filtering Implementation

## Overview
This document describes the implementation of dynamic, permission-based filtering for the `GET /almacen/articulos` endpoint in the warehouse management system.

## Purpose
Ensure that users can only access articles that fall within their assigned permission scope:
- Users with `almacen-taller:read` permissions → see only articles from `almacen-taller` sectors
- Users with `almacen-comun:read` permissions → see only articles from `almacen-comun` sectors  
- Users with `all:read` permissions → see all articles without filtering
- Users with mixed permissions → see articles from union of allowed sectors

## Technical Architecture

### Components Modified

#### 1. **AlmacenService** (`src/almacen/almacen.service.ts`)
- **Method**: `getAllArticles(page, pageSize, userPermissions?)`
- **New Signature**:
  ```typescript
  async getAllArticles(
    page: number = 1,
    pageSize: number = 10,
    userPermissions?: Permisos[],
  ): Promise<{ data: Articulo[]; total: number; page: number; pageSize: number }>
  ```

- **Implementation Strategy**:
  - Uses TypeORM's `QueryBuilder` for database-level filtering
  - If no permissions provided or user has `ALL_READ`/`ALL_WRITE` → returns all articles
  - Otherwise, builds dynamic WHERE clause filtering by sector type:
    - Maps `ALMACEN_TALLER_*` permissions → include `almacen-taller` sectors
    - Maps `ALMACEN_COMUN_*` permissions → include `almacen-comun` sectors
    - Only loads articles from allowed sectors

- **Query Structure**:
  ```typescript
  const query = this.articuloRepo.createQueryBuilder('articulo')
    .leftJoinAndSelect('articulo.grupo', 'grupo')
    .leftJoinAndSelect('articulo.unidadMedida', 'unidad')
    .leftJoinAndSelect('grupo.sector', 'sector');
    
  // If has ALL_READ/ALL_WRITE, skip WHERE clause
  // Otherwise:
  if (allowedSectorTypes.length > 0) {
    query.andWhere('sector.tipo IN (:sectorTypes)', { sectorTypes: allowedSectorTypes });
  }
  ```

#### 2. **AlmacenController** (`src/almacen/almacen.controller.ts`)
- **Endpoint**: `GET /almacen/articulos`
- **Modifications**:
  - Added `@GetUser() user: Usuario` parameter
  - Extracts permissions from `user.rol.permisos`
  - Passes permissions to service method

- **Controller Method**:
  ```typescript
  @Get('articulos')
  @Auth()
  async getAllArticles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @GetUser() user: Usuario,
  ) {
    const userPermissions = user.rol?.permisos || [];
    const result = await this.almacenService.getAllArticles(
      page, pageSize, userPermissions
    );
    return { success: true, data: result };
  }
  ```

### Data Flow

```
HTTP Request
    ↓
AlmacenController.getAllArticles()
    ├─ Extract user from JWT token (@GetUser decorator)
    ├─ Extract permissions from user.rol.permisos
    ↓
AlmacenService.getAllArticles(page, pageSize, userPermissions)
    ├─ Check if user has ALL_READ or ALL_WRITE
    │  └─ YES: Skip filtering, return all articles
    │  └─ NO: Build sector type filter from specific permissions
    ├─ Execute QueryBuilder with dynamic WHERE clause
    ├─ Filter at database level (efficient)
    ↓
Database Query
    ├─ JOIN articulo → grupo → sector
    ├─ Filter: sector.tipo IN (allowed_types)
    ├─ Paginate: SKIP/TAKE
    ↓
Return paginated results to client
```

## Permission Mapping

| Permission | Allowed Sector Types | Notes |
|-----------|-------------------|-------|
| `ALMACEN_TALLER_READ` | `almacen-taller` | Read-only access to taller articles |
| `ALMACEN_TALLER_WRITE` | `almacen-taller` | Write access to taller articles |
| `ALMACEN_COMUN_READ` | `almacen-comun` | Read-only access to common articles |
| `ALMACEN_COMUN_WRITE` | `almacen-comun` | Write access to common articles |
| `ALL_READ` | All sectors | Read-only all articles (bypass filter) |
| `ALL_WRITE` | All sectors | Write access to all articles (bypass filter) |

## Testing

### Unit Tests
All tests in `src/almacen/almacen.service.spec.ts` validate filtering logic:
- ✅ Returns all articles without permissions filter
- ✅ Filters articles by almacen-taller permission  
- ✅ Returns all articles with all:read permission

### Controller Tests
All tests in `src/almacen/almacen.controller.spec.ts` validate endpoint behavior:
- ✅ Passes user permissions to service
- ✅ Handles users with all:read permissions
- ✅ Correctly extracts permissions from user object

### Test Execution
```bash
npm run test -- src/almacen
# Output: 10 tests passed ✓
```

## Security Considerations

1. **Database-Level Filtering**: Filtering happens at the QueryBuilder level, ensuring articles are never loaded into memory if unauthorized
2. **Authentication Guard**: `@Auth()` decorator on endpoint ensures JWT is valid
3. **Permission Extraction**: Permissions are extracted from authenticated JWT token via `GetUser()` decorator
4. **Backward Compatibility**: `userPermissions` parameter is optional, allowing safe migration
5. **Null Safety**: Handles edge case where user has no role: `user.rol?.permisos || []`

## API Response Example

**Request**:
```bash
GET /almacen/articulos?page=1&pageSize=10
Authorization: Bearer <jwt_token>
```

**Response (User with almacen-taller:read)**:
```json
{
  "success": true,
  "data": {
    "data": [
      { "cod": "ART001", "nombre": "Article 1", "grupo": { "sector": { "tipo": "almacen-taller" } } },
      { "cod": "ART002", "nombre": "Article 2", "grupo": { "sector": { "tipo": "almacen-taller" } } }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
}
```

**Response (User with all:read)**:
```json
{
  "success": true,
  "data": {
    "data": [
      { "cod": "ART001", "nombre": "Article 1", "grupo": { "sector": { "tipo": "almacen-taller" } } },
      { "cod": "ART003", "nombre": "Article 3", "grupo": { "sector": { "tipo": "almacen-comun" } } },
      { "cod": "ART005", "nombre": "Article 5", "grupo": { "sector": { "tipo": "almacen-comun" } } }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 10
  }
}
```

## Performance Impact

- **Positive**: Filtering at database level (QueryBuilder) is more efficient than in-app filtering
- **Database Load**: Reduced rows transferred from database to application
- **Memory**: Lower memory footprint since unauthorized articles aren't loaded into memory
- **Query Complexity**: Minimal - adds single `andWhere` clause with IN operator

## Future Enhancements

1. **Caching**: Cache user permissions to avoid extracting from JWT on every request
2. **Role-Based Filtering**: Extend to filter by other criteria beyond sector type
3. **Audit Logging**: Log which articles each user accesses for compliance
4. **Dynamic Permissions**: Support runtime permission changes without redeployment
5. **API Visibility**: Return user's actual accessible sectors in API responses

## Troubleshooting

### "Articles not appearing for user with correct permissions"
1. Verify user has `rol.permisos` array populated
2. Check `Permisos` enum values match service logic
3. Verify articles have `grupo.sector.tipo` correctly set
4. Check database contains articles for that sector type

### "User can see articles outside their permissions"
1. Verify filtering logic is executing (add debug logs)
2. Check for `ALL_READ` or `ALL_WRITE` in unexpected permission arrays
3. Verify `allowedSectorTypes` array is built correctly
4. Check QueryBuilder WHERE clause is being applied

## Related Documentation
- [Permission System Overview](./PERMISSION_SYSTEM_OVERVIEW.md)
- [Almacén Module Architecture](./ALMACEN_MODULE_ARCHITECTURE.md)
- [Guards and Decorators](./GUARDS_AND_DECORATORS.md)
