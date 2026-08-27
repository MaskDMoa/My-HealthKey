-- Criar Tabela de Farmácias
CREATE TABLE pharmacies (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  owner_id uuid REFERENCES auth.users(id), -- Referência ao usuário logado (dono)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar Tabela de Medicamentos
CREATE TABLE medicines (
  id text PRIMARY KEY,
  name text NOT NULL,
  active_ingredient text,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar Tabela de Relação (Preços/Estoque)
CREATE TABLE pharmacy_medicines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id text REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id text REFERENCES medicines(id) ON DELETE CASCADE,
  price numeric(10, 2) NOT NULL,
  is_available boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(pharmacy_id, medicine_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_medicines ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (Todos podem ler)
CREATE POLICY "Permitir leitura pública para pharmacies" ON pharmacies FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública para medicines" ON medicines FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública para pharmacy_medicines" ON pharmacy_medicines FOR SELECT USING (true);

-- Políticas de Escrita (Apenas Donos podem modificar)
CREATE POLICY "Donos podem gerenciar suas farmácias" ON pharmacies FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Donos podem gerenciar estoque" ON pharmacy_medicines FOR ALL USING (
  EXISTS (
    SELECT 1 FROM pharmacies 
    WHERE pharmacies.id = pharmacy_medicines.pharmacy_id 
    AND pharmacies.owner_id = auth.uid()
  )
);

-- Inserir Farmácias (Mock Data)
INSERT INTO pharmacies (id, name, address, latitude, longitude) VALUES 
('f1', 'Ultra Popular', 'Avenida Rio Branco, 67, Centro, Santa Rita do Sapucaí, MG', -22.2507792, -45.704918),
('f2', 'Drogaria Santa Rita', 'Rua Silvestre Ferraz, 234, Centro, Santa Rita do Sapucaí, MG', -22.2517136, -45.7071546),
('f3', 'Drogaria Economize', 'Rua Silvestre Ferraz, 68, Centro, Santa Rita do Sapucaí, MG', -22.2517136, -45.7071546),
('f4', 'Farmácia de Manipulação Central', 'Avenida Antônio Paulino, 50, Centro, Santa Rita do Sapucaí, MG', -22.2545488, -45.703092),
('f5', 'Drogaria Francisco Palma', 'Rua Francisco Palma, 196, Centro, Santa Rita do Sapucaí, MG', -22.2531869, -45.7021729),
('f6', 'Natus Farma', 'Rua Comendador Custódio Ribeiro, 224, Centro, Santa Rita do Sapucaí, MG', -22.2491574, -45.7040712),
('f7', 'Drogaria Carvalho', 'Avenida Antônio Paulino, 50, Centro, Santa Rita do Sapucaí, MG', -22.2545488, -45.703092),
('f8', 'Drogaria Pague Menos', 'Avenida João de Camargo, 120, Centro, Santa Rita do Sapucaí, MG', -22.252000, -45.705000);

-- Inserir Medicamentos (Mock Data)
INSERT INTO medicines (id, name, active_ingredient) VALUES 
('1', 'Paracetamol 500mg', 'Paracetamol'),
('2', 'Dipirona 1g', 'Dipirona Sódica'),
('3', 'Ibuprofeno 400mg', 'Ibuprofeno');

-- Inserir Preços (Mock Data)
INSERT INTO pharmacy_medicines (medicine_id, pharmacy_id, price) VALUES 
-- Preços para Medicamento 1 (Paracetamol)
('1', 'f1', 10.9), ('1', 'f2', 12.9), ('1', 'f3', 11.5), ('1', 'f4', 9.9), 
('1', 'f5', 13.9), ('1', 'f6', 12.2), ('1', 'f7', 11.9), ('1', 'f8', 10.5),

-- Preços para Medicamento 2 (Dipirona)
('2', 'f1', 19.9), ('2', 'f2', 18.5), ('2', 'f3', 17.9), ('2', 'f4', 20.5), 
('2', 'f6', 18.0), ('2', 'f7', 17.5), ('2', 'f8', 19.2),

-- Preços para Medicamento 3 (Ibuprofeno)
('3', 'f1', 8.9), ('3', 'f2', 9.5), ('3', 'f3', 8.5), ('3', 'f4', 7.9), 
('3', 'f5', 9.9), ('3', 'f6', 8.7), ('3', 'f7', 8.3), ('3', 'f8', 8.1);
