#!/bin/bash

# Script de teste para cadastro de cliente com dados formatados

echo "==================================================================="
echo "  TESTE DE CADASTRO DE CLIENTE - COM FORMATAÇÃO"
echo "==================================================================="
echo ""

API_URL="http://localhost:3001"

# Teste 1: Cadastro com telefone e CPF formatados
echo "📝 Teste 1: Cadastro com telefone e CPF formatados"
echo "-------------------------------------------------------------------"

CUSTOMER_DATA='{
  "name": "Maria Silva Teste",
  "email": "maria.teste.'$(date +%s)'@email.com",
  "phone": "11987654321",
  "cpf": "12345678901",
  "password": "SenhaForte123!@#"
}'

echo "Dados enviados:"
echo "$CUSTOMER_DATA" | jq .
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$CUSTOMER_DATA" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status HTTP: $HTTP_STATUS"
echo "Resposta:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ SUCESSO: Cliente cadastrado com sucesso!"

  # Extrair ID do cliente
  CUSTOMER_ID=$(echo "$BODY" | jq -r '.data.customer.id' 2>/dev/null)

  if [ -n "$CUSTOMER_ID" ] && [ "$CUSTOMER_ID" != "null" ]; then
    echo "📋 ID do cliente: $CUSTOMER_ID"

    # Teste 2: Verificar se cliente foi salvo no banco
    echo ""
    echo "📝 Teste 2: Verificar dados salvos no banco"
    echo "-------------------------------------------------------------------"

    # Tentar fazer login com o cliente criado
    LOGIN_DATA=$(echo "$CUSTOMER_DATA" | jq '{identifier: .email, password: .password}')

    echo "Tentando login com:"
    echo "$LOGIN_DATA" | jq .
    echo ""

    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "$LOGIN_DATA" \
      -w "\nHTTP_STATUS:%{http_code}")

    LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')

    echo "Status HTTP: $LOGIN_STATUS"
    echo "Resposta:"
    echo "$LOGIN_BODY" | jq . 2>/dev/null || echo "$LOGIN_BODY"
    echo ""

    if [ "$LOGIN_STATUS" = "200" ]; then
      echo "✅ SUCESSO: Login realizado! Dados foram persistidos corretamente."

      # Verificar se telefone e CPF foram salvos sem formatação
      SAVED_PHONE=$(echo "$LOGIN_BODY" | jq -r '.data.customer.phone' 2>/dev/null)
      SAVED_CPF=$(echo "$LOGIN_BODY" | jq -r '.data.customer.cpf' 2>/dev/null)

      echo ""
      echo "📊 Dados salvos no banco:"
      echo "   Telefone: $SAVED_PHONE (esperado: apenas dígitos)"
      echo "   CPF: $SAVED_CPF (esperado: apenas dígitos)"

      # Validar formato
      if [[ "$SAVED_PHONE" =~ ^[0-9]+$ ]]; then
        echo "   ✅ Telefone salvo corretamente (apenas dígitos)"
      else
        echo "   ❌ ERRO: Telefone contém caracteres não numéricos"
      fi

      if [ -n "$SAVED_CPF" ] && [ "$SAVED_CPF" != "null" ]; then
        if [[ "$SAVED_CPF" =~ ^[0-9]+$ ]]; then
          echo "   ✅ CPF salvo corretamente (apenas dígitos)"
        else
          echo "   ❌ ERRO: CPF contém caracteres não numéricos"
        fi
      fi
    else
      echo "❌ ERRO: Login falhou após cadastro"
    fi
  fi
else
  echo "❌ ERRO: Falha no cadastro"
  echo "Verifique se o backend está rodando em $API_URL"
fi

echo ""
echo "==================================================================="
echo "  FIM DOS TESTES"
echo "==================================================================="
