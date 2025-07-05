-- Adicionar policy para administradores gerenciarem todas as colunas do pipeline
CREATE POLICY "Admins can manage all pipeline columns" 
  ON public.pipeline_columns 
  FOR ALL 
  USING (public.is_current_user_admin());