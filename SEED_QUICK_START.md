# Guía de Uso del Módulo Seed

## ¿Qué es el Seed?

El módulo **Seed** permite popular automáticamente la base de datos con datos de ejemplo respetando las relaciones entre entidades. Es ideal para:
- ✅ Desarrollo local
- ✅ Testing
- ✅ Demos
- ✅ Validar integridad de datos

## Inicio Rápido

### 1. Asegurate que PostgreSQL está corriendo
```bash
docker-compose up -d
```

### 2. Inicia la aplicación
```bash
pnpm run start:dev
```

### 3. Ejecuta el seed (endpoint)
```bash
curl -X POST http://localhost:3000/seed/run
```

**Respuesta esperada:**
```json
{
  "message": "Base de datos poblada exitosamente",
  "results": {
    "sector": 5,
    "vehiculo": 5,
    "articulo": 8,
    ...
  }
}
```

## Archivos Creados

### Estructura
```
src/seed/
├── data/              # CSV con datos
├── sql/               # Scripts SQL
├── csv-reader.service.ts
├── seed.service.ts
├── seed.controller.ts
├── seed.module.ts
└── README.md
```

### CSV (datos de ejemplo)
- `sectores.csv` - 5 sectores
- `vehiculos.csv` - 5 vehículos
- `articulos.csv` - 8 artículos
- Y más...

### SQL (scripts DDL/DML)
- `01_crear_tablas_vehiculos.sql` - Crea tablas de vehículos
- `02_crear_tablas_almacen.sql` - Crea tablas de almacén
- `03_insertar_datos_vehiculos.sql` - Inserta datos de vehículos
- `04_insertar_datos_almacen.sql` - Inserta datos de almacén
- `05_queries_utiles_validacion.sql` - Queries para validar datos

## Usar Scripts SQL Directamente

Si prefieres ejecutar SQL directamente en DBeaver:

1. **En DBeaver**: New SQL Script
2. **Copiar contenido** de cada archivo SQL en orden:
   - `01_crear_tablas_vehiculos.sql`
   - `02_crear_tablas_almacen.sql`
   - `03_insertar_datos_vehiculos.sql`
   - `04_insertar_datos_almacen.sql`
3. **Ejecutar** (Ctrl+Enter)

## Validar Datos

### Query rápida para listar vehículos
```sql
SELECT id_vehiculo, nombre, marca, status FROM vehiculo;
```

### Query para listar artículos
```sql
SELECT cod, nombre, modelo FROM articulo;
```

Más queries en: `src/seed/sql/05_queries_utiles_validacion.sql`

## Agregar Más Datos

### Opción 1: Editar archivos CSV
1. Abrir `src/seed/data/tu_archivo.csv`
2. Agregar nuevas filas
3. Ejecutar seed nuevamente

### Opción 2: Agregar en SeedService

Ejemplo para agregar nueva tabla:
```typescript
// En seed.service.ts
private async seedNuevaEntidad(): Promise<number> {
  this.logger.log('Cargando nueva entidad...');
  const data = await this.csvReaderService.readCsv('nueva_entidad');
  await this.nuevoRepository.save(data);
  this.logger.log(`✓ ${data.length} registros cargados`);
  return data.length;
}

// Llamar en seed() en orden correcto
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "CSV no encontrado" | Verificar archivo existe en `src/seed/data/` |
| "Foreign key violation" | Verificar que entidades padre existan primero |
| "Duplicate key" | IDs en CSV son duplicados, cambiar o eliminar |
| Puerto 5432 en uso | Cambiar puerto en docker-compose.yml |

## Limpiar Base de Datos

### Opción 1: Con Docker
```bash
docker-compose down -v  # Elimina volumen de datos
docker-compose up -d    # Inicia nueva BD limpia
```

### Opción 2: Script SQL
```sql
-- Ejecutar en DBeaver todos estos DELETE en orden inverso:
DELETE FROM recordatorio;
DELETE FROM status_update;
DELETE FROM combustible_carga;
DELETE FROM salida;
DELETE FROM entrada;
DELETE FROM movimiento;
DELETE FROM info_adicional;
DELETE FROM vehiculo;
DELETE FROM articulo;
DELETE FROM grupo_articulo;
DELETE FROM unidad_medida_cuant;
DELETE FROM sector_galpon;
DELETE FROM sector;
```

## Jerarquía de Carga

El seed respeta este orden de inserción:

**Vehículos:**
1. Sector → 2. Vehiculo → 3. InfoAdicional
4. CombustibleCarga, StatusUpdate, Recordatorio

**Almacén:**
1. SectorGalpon → 2. UnidadMedida → 3. GrupoArticulo
4. Articulo → 5. Movimiento → 6. Entrada/Salida

## Ejemplos Prácticos

### Verificar total de datos cargados
```bash
curl -X GET http://localhost:3000/seed/run | jq '.results | add'
```

### Listar todos los vehículos (SQL)
```sql
SELECT nombre, marca, modelo, status FROM vehiculo ORDER BY id_vehiculo;
```

### Ver histórico de combustible
```sql
SELECT v.nombre, cc.fecha_carga, cc.cant_combustible_despachado 
FROM combustible_carga cc
JOIN vehiculo v ON cc.id_vehiculo = v.id_vehiculo
ORDER BY cc.fecha_carga DESC;
```

## Documentación Completa

Para más detalles: `src/seed/README.md`

## Preguntas Frecuentes

**¿Puedo ejecutar seed múltiples veces?**
✅ Sí, el seed usa `ON CONFLICT ... DO NOTHING`, no creará duplicados

**¿Se eliminan datos al ejecutar seed?**
❌ No, solo inserta. Limpiar datos manualmente si lo necesitas

**¿Puedo agregar más datos?**
✅ Sí, editar CSV o agregar más filas en seedService

**¿Funciona en producción?**
⚠️ No recomendado. Use para desarrollo/testing solamente

---

**¡Listo!** Ahora puedes poblar tu BD con datos de ejemplo. 🎉
