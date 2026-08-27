-- ==========================================
-- UPDATE 1: Adicionar colunas em pharmacies
-- ==========================================
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS trade_name text, -- Nome fantasia
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website_url text;

-- ==========================================
-- UPDATE 2: Criar tabela cart_items
-- ==========================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pharmacy_id text REFERENCES pharmacies(id) NOT NULL,
  medicine_id text REFERENCES medicines(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- UPDATE 3: Políticas de RLS para cart_items
-- ==========================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios itens do carrinho
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem inserir no próprio carrinho
CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios itens
CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios itens
CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
