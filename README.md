# Galpon Vial Intranet Backend

## Description

Galpon Vial Intranet Backend - API REST construida con [NestJS](https://github.com/nestjs/nest) y PostgreSQL.

## Requisitos Previos

- Node.js (v18+)
- pnpm
- Docker y Docker Compose
- DBeaver (opcional, para gestión de BD)

## Project setup

```bash
$ pnpm install
```

## Base de Datos

Este proyecto utiliza PostgreSQL 16 Alpine. La configuración se encuentra en `docker-compose.yml`.

### Iniciar PostgreSQL

```bash
# Iniciar contenedor PostgreSQL en background
$ docker-compose up -d

# Ver logs del contenedor
$ docker-compose logs postgres

# Detener el contenedor
$ docker-compose down

# Detener y limpiar volúmenes (elimina datos)
$ docker-compose down -v
```

**Configuración de conexión:**
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** `postgres`
- **Password:** (vacío - configurado en trust mode)

### Conectar con DBeaver

1. Nueva conexión → PostgreSQL
2. Rellena los datos con la configuración anterior
3. Test Connection → Finish

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Flujo de Trabajo Recomendado

1. **Iniciar ambiente:**
   ```bash
   docker-compose up -d  # Inicia PostgreSQL
   pnpm install         # Instala dependencias
   ```

2. **Desarrollo:**
   ```bash
   pnpm run start:dev   # Inicia en watch mode
   ```

3. **Testing:**
   ```bash
   pnpm run test        # Ejecuta tests unitarios
   pnpm run test:e2e    # Ejecuta tests E2E
   ```

4. **Construcción:**
   ```bash
   pnpm run build       # Build para producción
   ```

## Estructura del Proyecto

```
src/
├── app.controller.ts     # Controlador principal
├── app.service.ts        # Servicio principal
├── app.module.ts         # Módulo raíz
└── main.ts              # Punto de entrada

test/
├── app.e2e-spec.ts      # Tests E2E

docker-compose.yml       # Configuración de servicios
```

## Variables de Entorno

Crear un archivo `.env` en la raíz (opcional):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=postgres
```

## Deployment

Consulta la [documentación oficial de NestJS](https://docs.nestjs.com/deployment) para desplegar en producción.

## Troubleshooting

### PostgreSQL no conecta
```bash
# Verificar si el contenedor está corriendo
docker-compose ps

# Ver logs del contenedor
docker-compose logs postgres

# Reiniciar el contenedor
docker-compose restart postgres
```

### Puerto 5432 en uso
```bash
# Cambiar el puerto en docker-compose.yml
# ports:
#   - "5433:5432"  # Usa 5433 en lugar de 5432
```

### Limpiar todo y reiniciar
```bash
docker-compose down -v  # Detiene y elimina datos
docker-compose up -d    # Inicia nuevamente
```

## License

Este proyecto es de propiedad de Galpon Vial.

