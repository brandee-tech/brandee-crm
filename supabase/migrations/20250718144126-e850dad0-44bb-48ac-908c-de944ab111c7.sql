
-- Atualizar a política de DELETE para schedule_blocks
-- Permitir que administradores deletem qualquer bloqueio da empresa
-- Usuários normais só podem deletar seus próprios bloqueios
DROP POLICY IF EXISTS "Users can delete their own schedule blocks" ON public.schedule_blocks;

CREATE POLICY "Users can delete schedule blocks with admin privileges" 
  ON public.schedule_blocks 
  FOR DELETE 
  USING (
    user_id = auth.uid() OR 
    (is_current_user_admin() AND company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ))
  );

-- Atualizar a política de UPDATE para consistência
-- Permitir que administradores editem qualquer bloqueio da empresa
DROP POLICY IF EXISTS "Users can update their own schedule blocks" ON public.schedule_blocks;

CREATE POLICY "Users can update schedule blocks with admin privileges" 
  ON public.schedule_blocks 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    (is_current_user_admin() AND company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ))
  );
