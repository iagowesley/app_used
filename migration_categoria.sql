-- Migração para adicionar colunas na tabela produtos
-- Execute este SQL no seu painel do Supabase (SQL Editor)

-- Adicionar coluna categoria
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outros';

-- Adicionar coluna condicao (novo, seminovo, usado)
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS condicao TEXT NOT NULL DEFAULT 'usado';

-- Adicionar coluna formas_pagamento (array de strings)
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS formas_pagamento TEXT[] NOT NULL DEFAULT ARRAY['pix'];

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_condicao ON produtos(condicao);
CREATE INDEX IF NOT EXISTS idx_produtos_formas_pagamento ON produtos USING GIN(formas_pagamento);

-- Comentários das colunas
COMMENT ON COLUMN produtos.categoria IS 'Categoria do produto (eletronicos, moveis, veiculos, etc)';
COMMENT ON COLUMN produtos.condicao IS 'Condição do produto (novo, seminovo, usado)';
COMMENT ON COLUMN produtos.formas_pagamento IS 'Array com formas de pagamento aceitas (pix, dinheiro, cartao_credito, etc)';

