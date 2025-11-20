#!/bin/bash

API_URL="http://localhost:3001"

echo "=========================================="
echo "TESTE: Workload dos Mecânicos"
echo "=========================================="
echo ""

# 1. Login como admin
echo "1️⃣  Fazendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moria.com",
    "password": "Test123!"
  }' \
  -c cookies.txt)

echo "Login status: $(echo $LOGIN_RESPONSE | grep -o '"success":[^,]*')"
echo ""

# 2. Buscar workload dos mecânicos
echo "2️⃣  Buscando workload dos mecânicos..."
WORKLOAD_RESPONSE=$(curl -s "${API_URL}/revisions/mechanics/workload" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "$WORKLOAD_RESPONSE" | python -m json.tool 2>/dev/null || echo "$WORKLOAD_RESPONSE"

# Limpar cookies
rm -f cookies.txt
