#!/bin/bash
# ============================================================
# SCRIPT DE TESTING - SEED MODULE
# ============================================================
# Uso: bash src/seed/test-seed.sh

BASE_URL="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════╗"
echo "║          TESTING MÓDULO SEED - Galpon Vial            ║"
echo "╚════════════════════════════════════════════════════════╝"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# TEST 1: Verificar que el servidor está running
# ============================================================
echo -e "${BLUE}[1/4] Verificando conexión con servidor...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/seed/run" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Servidor conectado${NC}"
else
    echo -e "${RED}✗ No se puede conectar a $BASE_URL${NC}"
    echo "   Asegúrate de que: docker-compose up -d"
    echo "                    pnpm run start:dev"
    exit 1
fi

# ============================================================
# TEST 2: Ejecutar el seed
# ============================================================
echo -e "\n${BLUE}[2/4] Ejecutando seed...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/seed/run" \
  -H "Content-Type: application/json")

# Verificar respuesta
if echo "$RESPONSE" | grep -q "Base de datos poblada exitosamente"; then
    echo -e "${GREEN}✓ Seed ejecutado exitosamente${NC}"
    echo ""
    echo "Resultados:"
    echo "$RESPONSE" | jq '.results' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}✗ Error al ejecutar seed${NC}"
    echo "$RESPONSE"
    exit 1
fi

# ============================================================
# TEST 3: Validar datos en BD
# ============================================================
echo -e "\n${BLUE}[3/4] Validando integridad de datos...${NC}"

# Nota: Requiere psql instalado localmente
# Si no tienes psql, usa DBeaver o comentar esta sección

echo "Para validar datos, ejecuta en DBeaver o pgAdmin:"
echo ""
echo "  SELECT COUNT(*) FROM vehiculo;"
echo "  SELECT COUNT(*) FROM articulo;"
echo "  SELECT COUNT(*) FROM movimiento;"
echo ""

# ============================================================
# TEST 4: Ejemplos de queries
# ============================================================
echo -e "\n${BLUE}[4/4] Queries de validación${NC}"
echo ""
echo "Copiar en DBeaver/pgAdmin para verificar:"
echo ""
echo "-- Ver todos los vehículos:"
echo "  SELECT id_vehiculo, nombre, marca, status FROM vehiculo;"
echo ""
echo "-- Ver todos los artículos:"
echo "  SELECT cod, nombre, modelo FROM articulo;"
echo ""
echo "-- Ver movimientos:"
echo "  SELECT * FROM movimiento;"
echo ""
echo "-- Estadísticas:"
echo "  SELECT"
echo "    (SELECT COUNT(*) FROM vehiculo) as vehiculos,"
echo "    (SELECT COUNT(*) FROM articulo) as articulos,"
echo "    (SELECT COUNT(*) FROM movimiento) as movimientos;"
echo ""

# ============================================================
# RESUMEN
# ============================================================
echo "╔════════════════════════════════════════════════════════╗"
echo -e "║               ${GREEN}✓ TESTS COMPLETADOS${NC}                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo "1. Abre DBeaver o pgAdmin"
echo "2. Conéctate a postgres://localhost:5432/postgres"
echo "3. Ejecuta las queries de validación"
echo "4. Revisa src/seed/sql/05_queries_utiles_validacion.sql"
echo ""
