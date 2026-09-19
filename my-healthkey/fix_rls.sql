-- Permitir que usuários autenticados criem novos medicamentos
CREATE POLICY "Permitir inserção de medicamentos por autenticados" 
ON medicines FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Permitir que usuários autenticados atualizem medicamentos (ex: descrição, imagem)
CREATE POLICY "Permitir atualização de medicamentos por autenticados"
ON medicines FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
