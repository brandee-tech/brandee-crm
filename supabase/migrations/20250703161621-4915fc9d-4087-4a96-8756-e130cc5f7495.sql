-- Criar política para permitir SaaS admins criarem convites para qualquer empresa
CREATE POLICY "SaaS admins can create invitations for any company"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (is_saas_admin_for_company_management());

-- Criar política para permitir SaaS admins atualizarem convites de qualquer empresa  
CREATE POLICY "SaaS admins can update invitations for any company"
  ON public.user_invitations
  FOR UPDATE
  USING (is_saas_admin_for_company_management());

-- Criar política para permitir SaaS admins deletarem convites de qualquer empresa
CREATE POLICY "SaaS admins can delete invitations for any company"
  ON public.user_invitations
  FOR DELETE
  USING (is_saas_admin_for_company_management());