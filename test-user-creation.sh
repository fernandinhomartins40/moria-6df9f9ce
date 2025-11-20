#!/bin/bash

# Script para testar criação e login de usuário com diferentes formatos de email

API_URL="http://localhost:3001"
ADMIN_TOKEN=""

echo "=========================================="
echo "TESTE: Criação e Login de Usuário"
echo "=========================================="
echo ""

# 1. Login como admin para obter token
echo "1️⃣  Fazendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moria.com",
    "password": "Test123!"
  }' \
  -c cookies.txt)

echo "Response: ${LOGIN_RESPONSE}"
echo ""

# 2. Criar usuário com EMAIL EM MAIÚSCULAS
echo "2️⃣  Criando usuário com email em MAIÚSCULAS (Test.User@Email.COM)..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/auth/admin/users" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email": "Test.User@Email.COM",
    "password": "TestPassword123",
    "name": "Test User",
    "role": "STAFF"
  }')

echo "Response: ${CREATE_RESPONSE}"
echo ""

# Extrair ID do usuário criado
USER_ID=$(echo "${CREATE_RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "User ID: ${USER_ID}"
echo ""

# 3. Tentar login com email em lowercase
echo "3️⃣  Tentando login com email em lowercase (test.user@email.com)..."
LOGIN_TEST_RESPONSE=$(curl -s -X POST "${API_URL}/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@email.com",
    "password": "TestPassword123"
  }')

echo "Response: ${LOGIN_TEST_RESPONSE}"

# Verificar se login foi bem sucedido
if echo "${LOGIN_TEST_RESPONSE}" | grep -q '"success":true'; then
  echo "✅ LOGIN BEM SUCEDIDO!"
else
  echo "❌ LOGIN FALHOU!"
fi
echo ""

# 4. Tentar login com email original em maiúsculas
echo "4️⃣  Tentando login com email original (Test.User@Email.COM)..."
LOGIN_TEST_RESPONSE2=$(curl -s -X POST "${API_URL}/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Test.User@Email.COM",
    "password": "TestPassword123"
  }')

echo "Response: ${LOGIN_TEST_RESPONSE2}"

if echo "${LOGIN_TEST_RESPONSE2}" | grep -q '"success":true'; then
  echo "✅ LOGIN BEM SUCEDIDO!"
else
  echo "❌ LOGIN FALHOU!"
fi
echo ""

# 5. Listar usuários com filtro de email
echo "5️⃣  Listando usuários com filtro de email (test.user)..."
LIST_RESPONSE=$(curl -s -X GET "${API_URL}/auth/admin/users?email=test.user" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "Response: ${LIST_RESPONSE}"
echo ""

# 6. Deletar usuário de teste
if [ ! -z "${USER_ID}" ]; then
  echo "6️⃣  Deletando usuário de teste (${USER_ID})..."
  DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/auth/admin/users/${USER_ID}" \
    -H "Content-Type: application/json" \
    -b cookies.txt)

  echo "Response: ${DELETE_RESPONSE}"
  echo "✅ Usuário deletado"
else
  echo "⚠️  Não foi possível deletar o usuário (ID não encontrado)"
fi

echo ""
echo "=========================================="
echo "TESTE CONCLUÍDO"
echo "=========================================="

# Limpar cookies
rm -f cookies.txt
