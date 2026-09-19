-- Adicionar colunas de horário de funcionamento à tabela pharmacies
-- Formato JSON para flexibilidade: cada dia da semana tem abertura, fechamento e se está fechado

ALTER TABLE pharmacies 
ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{
  "segunda": {"abre": "08:00", "fecha": "18:00", "fechado": false},
  "terca": {"abre": "08:00", "fecha": "18:00", "fechado": false},
  "quarta": {"abre": "08:00", "fecha": "18:00", "fechado": false},
  "quinta": {"abre": "08:00", "fecha": "18:00", "fechado": false},
  "sexta": {"abre": "08:00", "fecha": "18:00", "fechado": false},
  "sabado": {"abre": "08:00", "fecha": "13:00", "fechado": false},
  "domingo": {"abre": "", "fecha": "", "fechado": true}
}'::jsonb;
