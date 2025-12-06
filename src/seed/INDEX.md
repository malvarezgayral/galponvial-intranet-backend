# 📑 Índice del Módulo Seed - Navegación Rápida

## 📍 Ubicación
```
src/seed/
```

## 🗂️ Archivos por Tipo

### 📝 Documentación
- **[README.md](./README.md)** - Documentación completa del módulo
- **[METODOS_SEED.md](./METODOS_SEED.md)** - Comparación de 3 métodos de seed
- **[test-seed.sh](./test-seed.sh)** - Script bash para testing
- **[seed-requests.http](./seed-requests.http)** - Ejemplos de peticiones HTTP

### 🔧 Código TypeScript
- **[seed.service.ts](./seed.service.ts)** - Lógica principal (13 métodos)
- **[seed.controller.ts](./seed.controller.ts)** - Endpoint REST: POST /seed/run
- **[csv-reader.service.ts](./csv-reader.service.ts)** - Lector de archivos CSV
- **[seed.module.ts](./seed.module.ts)** - Módulo NestJS

### 📊 Datos (CSV)
```
data/
├── sectores.csv               5 registros
├── sectores_galpon.csv        5 registros
├── unidades_medida.csv        9 registros
├── grupos_articulo.csv        5 registros
├── articulos.csv              8 registros
├── vehiculos.csv              5 registros
├── info_adicional.csv         5 registros
├── movimientos.csv            5 registros
├── entradas.csv               4 registros
├── salidas.csv                1 registro
├── combustible_carga.csv      5 registros
├── status_update.csv          5 registros
└── recordatorios.csv          6 registros
```

### 🗄️ Scripts SQL
```
sql/
├── 01_crear_tablas_vehiculos.sql   DDL: 6 tablas + índices
├── 02_crear_tablas_almacen.sql     DDL: 7 tablas + índices
├── 03_insertar_datos_vehiculos.sql DML: 34 registros
├── 04_insertar_datos_almacen.sql   DML: 23 registros
└── 05_queries_utiles_validacion.sql 12+ queries para testing
```

---

## 🚀 Guías Rápidas

### Para Empezar (3 minutos)
1. Leer: [Quick Start](../SEED_QUICK_START.md)
2. Ejecutar: `curl -X POST http://localhost:3000/seed/run`
3. Validar: Usar queries en `sql/05_queries_utiles_validacion.sql`

### Entender el Diseño (10 minutos)
1. Leer: [METODOS_SEED.md](./METODOS_SEED.md)
2. Entender los 3 métodos
3. Elegir cuál usar

### Implementación Completa (20 minutos)
1. Leer: [README.md](./README.md)
2. Revisar: [seed.service.ts](./seed.service.ts)
3. Analizar: CSV y SQL

### Testing y Validación
1. Ejecutar: `bash test-seed.sh`
2. O usar: Queries en `sql/05_queries_utiles_validacion.sql`
3. Verificar en DBeaver/pgAdmin

---

## 📋 Checklist de Funcionalidad

- ✅ Lectura de CSV desde archivos
- ✅ Parseado automático de tipos
- ✅ Inserción en orden correcto (FK constraints)
- ✅ Endpoint REST para ejecutar
- ✅ Logging detallado
- ✅ Manejo de errores
- ✅ Respuestas JSON con estadísticas
- ✅ Scripts SQL DDL completos
- ✅ Scripts SQL DML con datos
- ✅ Queries de validación
- ✅ Documentación completa

---

## 📊 Estadísticas

| Métrica | Cantidad |
|---------|----------|
| Archivos TypeScript | 4 |
| Archivos CSV | 13 |
| Archivos SQL | 5 |
| Archivos Documentación | 5 |
| Líneas de código TS | ~400 |
| Líneas de datos CSV | 73 |
| Líneas de SQL | ~600 |
| Registros totales | 73 |

---

## 🔄 Dependencias

### Módulos Importados
- `@nestjs/common` - Decoradores
- `@nestjs/typeorm` - ORM
- `typeorm` - Repositorios
- `fs` - Lectura de archivos

### Entidades Inyectadas
- 13 repositorios de TypeORM
- CsvReaderService
- SeedService

---

## 🎯 Endpoints Disponibles

```
POST /seed/run
├── Descripción: Ejecuta seed completo
├── Respuesta: { message, results }
└── Tiempo: ~2-3 segundos
```

### Próximos Endpoints Sugeridos
- `GET /seed/status` - Estado actual
- `GET /seed/validate` - Validar integridad
- `DELETE /seed/clear` - Limpiar datos
- `GET /seed/stats` - Estadísticas

---

## 🔐 Integridad de Datos

### Constraints Implementados
- ✅ Foreign Keys (15+)
- ✅ Check constraints (ENUM)
- ✅ Unique constraints
- ✅ NOT NULL constraints
- ✅ Índices en FK y búsquedas

### Orden de Inserción
```
FASE 1: Base (sin dependencias)
  Sector, SectorGalpon, UnidadMedidaCuant

FASE 2: Intermedias
  GrupoArticulo, Vehiculo

FASE 3: Relacionadas
  Articulo, InfoAdicional, Movimiento

FASE 4: Finales
  Entrada, Salida, CombustibleCarga, 
  StatusUpdate, Recordatorio
```

---

## 🛠️ Uso Práctico

### 1️⃣ Opción Rápida (REST)
```bash
curl -X POST http://localhost:3000/seed/run
```

### 2️⃣ Opción Completa (SQL)
```bash
psql -U postgres -h localhost < sql/01_crear_tablas_vehiculos.sql
psql -U postgres -h localhost < sql/02_crear_tablas_almacen.sql
psql -U postgres -h localhost < sql/03_insertar_datos_vehiculos.sql
psql -U postgres -h localhost < sql/04_insertar_datos_almacen.sql
```

### 3️⃣ Opción Script
```bash
bash test-seed.sh
```

---

## 📚 Referencias Cruzadas

### Documentación Relacionada
- [SEED_QUICK_START.md](../SEED_QUICK_START.md) - Guía rápida
- [SEED_RESUMEN.md](../SEED_RESUMEN.md) - Resumen técnico
- [app.module.ts](../app.module.ts) - Importa SeedModule

### Entidades Relacionadas
- Vehículos: `src/vehiculos/entities/`
- Almacén: `src/almacen/entities/`

### Pruebas
- Unit tests: `*.spec.ts`
- E2E tests: `test/`

---

## 💡 Tips & Tricks

### Editar Datos de Seed
```bash
# 1. Editar archivo CSV
vim src/seed/data/vehiculos.csv

# 2. Ejecutar seed
curl -X POST http://localhost:3000/seed/run
```

### Agregar Nueva Entidad
```typescript
// 1. Crear CSV en data/
// 2. Agregar método en SeedService
private async seedNuevaEntidad(): Promise<number> { ... }
// 3. Llamar en seed()
// 4. Registrar repositorio en módulo
```

### Validar Integridad
```sql
-- Ejecutar query en DBeaver
src/seed/sql/05_queries_utiles_validacion.sql
```

### Debuggear Issues
```bash
# Ver logs en tiempo real
pnpm run start:dev

# Ver request detallado
curl -v -X POST http://localhost:3000/seed/run
```

---

## 🐛 Troubleshooting

| Error | Solución |
|-------|----------|
| CSV not found | Verificar archivo en `data/` |
| Foreign key error | Revisar orden de inserción |
| Duplicate key | Limpiar BD: `docker-compose down -v` |
| 404 Not Found | Importar SeedModule en app.module |
| 500 Error | Ver logs en terminal |

---

## 📞 Soporte Rápido

**¿Cómo empiezo?**
→ Lee [SEED_QUICK_START.md](../SEED_QUICK_START.md)

**¿Cómo agrego datos?**
→ Edita archivos CSV en `data/`

**¿Cómo valido?**
→ Ejecuta queries en `sql/05_queries_utiles_validacion.sql`

**¿Cómo limpio?**
→ `docker-compose down -v`

**¿Más detalle?**
→ Lee [README.md](./README.md)

---

**Navegación Rápida:**
- 🚀 [Inicio Rápido](../SEED_QUICK_START.md)
- 📖 [Documentación](./README.md)
- 🔍 [Métodos Disponibles](./METODOS_SEED.md)
- 📝 [Resumen Técnico](../SEED_RESUMEN.md)

---

*Última actualización: Diciembre 4, 2025*
*Módulo: Seed v1.0 - Completo y Funcional* ✨
