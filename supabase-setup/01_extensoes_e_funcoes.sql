-- ========================================
-- PASSO 1: EXTENSÕES E FUNÇÕES BÁSICAS
-- Execute este SQL PRIMEIRO no Supabase SQL Editor
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificar se foi criado com sucesso
SELECT 'Extensões e funções criadas com sucesso!' as status;