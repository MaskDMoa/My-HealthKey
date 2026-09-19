-- Cria a tabela de reviews
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  medicine_id text REFERENCES public.medicines(id) ON DELETE CASCADE,
  pharmacy_id text REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativa Segurança a Nível de Linha (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos podem ver as avaliações (Leitura Pública)
CREATE POLICY "Reviews são visíveis para todos" 
ON public.reviews FOR SELECT 
USING (true);

-- Política 2: Apenas usuários autenticados (que NÃO são farmácias) podem inserir
CREATE POLICY "Apenas usuários não-farmácia podem avaliar" 
ON public.reviews FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.pharmacies WHERE owner_id = auth.uid()
  )
);
