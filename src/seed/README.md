# Módulo Seed - Documentación

## Descripción

El módulo Seed permite popular la base de datos con datos iniciales para desarrollo y testing. Incluye archivos CSV con datos y servicios para leerlos e insertarlos respetando la jerarquía de relaciones entre entidades.

## Estructura del Módulo

```
src/seed/
├── data/
│   ├── sectores.csv                    # Sectores de la empresa (vehiculos)
│   ├── sectores_galpon.csv            # Sectores del galpon (almacen)
│   ├── unidades_medida.csv            # Unidades de medida cuantitativa
│   ├── grupos_articulo.csv            # Grupos de artículos
│   ├── articulos.csv                   # Artículos del inventario
│   ├── vehiculos.csv                   # Vehículos
│   ├── info_adicional.csv             # Info adicional de vehículos
│   ├── movimientos.csv                # Movimientos de artículos
│   ├── entradas.csv                    # Entradas de artículos
│   ├── salidas.csv                     # Salidas de artículos
│   ├── combustible_carga.csv           # Cargas de combustible
│   ├── status_update.csv               # Actualizaciones de estado
│   └── recordatorios.csv               # Recordatorios de mantenimiento
├── sql/
│   ├── 01_crear_tablas_vehiculos.sql  # DDL para tablas de vehiculos
│   ├── 02_crear_tablas_almacen.sql    # DDL para tablas de almacen
│   ├── 03_insertar_datos_vehiculos.sql # DML para insertar datos (vehiculos)
│   └── 04_insertar_datos_almacen.sql  # DML para insertar datos (almacen)
├── csv-reader.service.ts              # Servicio para leer archivos CSV
├── seed.service.ts                     # Lógica principal de seed
├── seed.controller.ts                  # Controlador REST
├── seed.module.ts                      # Módulo
└── README.md                           # Este archivo
```

## Orden de Carga de Datos

El módulo respeta la jerarquía de relaciones entre entidades:

### Vehículos (orden correcto):
1. **Sector** - Base, sin dependencias
2. **Vehiculo** - Base
3. **InfoAdicional** - Depende de Sector y Vehiculo
4. **CombustibleCarga** - Depende de Vehiculo
5. **StatusUpdate** - Depende de Vehiculo
6. **Recordatorio** - Depende de Vehiculo

### Almacén (orden correcto):
1. **SectorGalpon** - Base
2. **UnidadMedidaCuant** - Base
3. **GrupoArticulo** - Depende de SectorGalpon
4. **Articulo** - Depende de GrupoArticulo y UnidadMedidaCuant
5. **Movimiento** - Depende de Articulo
6. **Entrada** - Depende de Movimiento
7. **Salida** - Depende de Movimiento

## Uso

### 1. Endpoint REST

Para ejecutar el seed, hacer un POST a:

```bash
POST http://localhost:3000/seed/run
```

Respuesta exitosa (200 OK):
```json
{
  "message": "Base de datos poblada exitosamente",
  "results": {
    "sector": 5,
    "sector_galpon": 5,
    "unidad_medida_cuant": 9,
    "grupo_articulo": 5,
    "articulo": 8,
    "vehiculo": 5,
    "info_adicional": 5,
    "movimiento": 5,
    "entrada": 4,
    "salida": 1,
    "combustible_carga": 5,
    "status_update": 5,
    "recordatorio": 6
  }
}
```

### 2. Scripts SQL Directos

Ejecutar en DBeaver o pgAdmin en orden:

```bash
# 1. Crear tablas de vehiculos
src/seed/sql/01_crear_tablas_vehiculos.sql

# 2. Crear tablas de almacen
src/seed/sql/02_crear_tablas_almacen.sql

# 3. Insertar datos de vehiculos
src/seed/sql/03_insertar_datos_vehiculos.sql

# 4. Insertar datos de almacen
src/seed/sql/04_insertar_datos_almacen.sql
```

## Servicios

### CsvReaderService

Lee archivos CSV y los convierte a objetos JavaScript.

```typescript
// Leer archivo
const data = await csvReaderService.readCsv('sectores');

// Validar existencia
const exists = csvReaderService.csvExists('vehiculos');
```

### SeedService

Contiene la lógica principal para popular la base de datos.

```typescript
// Ejecutar seed completo
const results = await seedService.seed();
```

## Estructura de Archivos CSV

### Ejemplo: sectores.csv
```csv
id_sector,nombre
1,Operaciones
2,Mantenimiento
3,Logística
4,Administrativo
5,Almacén Central
```

**Reglas:**
- Primera fila = encabezados
- Separador = coma (,)
- Valores numéricos se convierten automáticamente
- Valores vacíos se tratan como strings vacíos

## Agregar Más Datos

### Pasos para agregar nuevos datos:

1. **Crear archivo CSV** en `src/seed/data/`
2. **Agregar método en SeedService**:
   ```typescript
   private async seedNuevaEntidad(): Promise<number> {
     this.logger.log('Cargando nueva entidad...');
     const data = await this.csvReaderService.readCsv('nueva_entidad');
     // Mapear relaciones si es necesario
     await this.nuevoRepository.save(data);
     this.logger.log(`✓ ${data.length} registros cargados`);
     return data.length;
   }
   ```
3. **Llamar en seed()** en el orden correcto
4. **Agregar inyección de dependencias** en el constructor
5. **Registrar repositorio** en SeedModule

## Restricciones de Integridad

El sistema respeta:
- **Foreign Keys**: Referencias correctas a entidades padre
- **Enums**: Valores válidos en campos tipo ENUM
- **UNIQUE**: No permite duplicados en campos unique
- **NOT NULL**: Campos obligatorios siempre tienen valor

## Troubleshooting

### Error: "Archivo CSV no encontrado"
- Verificar que el archivo existe en `src/seed/data/`
- Verificar el nombre del archivo sin extensión

### Error: "Foreign key violation"
- Verificar que la entidad padre existe
- Revisar el orden de carga
- Verificar IDs en CSV

### Error: "Duplicate key value"
- CSV contiene IDs duplicados
- Limpiar datos o usar diferentes IDs

## Performance

Para grandes volúmenes de datos:
- Los scripts SQL directos son más rápidos
- El endpoint REST es más cómodo para desarrollo
- Usar `synchronize: false` en producción para mejor control

## Notas

- ⚠️ **ADVERTENCIA**: El seed limpia automáticamente datos duplicados (ON CONFLICT)
- Los CSV se leen desde el directorio compilado, asegurar que estén incluidos en build
- TypeORM maneja automáticamente las relaciones
