-- Adicionar policy para administradores atualizarem todos os perfis
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin());