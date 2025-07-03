-- Criar política para permitir SaaS admins verem todos os perfis
CREATE POLICY "SaaS admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_saas_admin_for_company_management());

-- Criar política para permitir SaaS admins atualizarem todos os perfis  
CREATE POLICY "SaaS admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (is_saas_admin_for_company_management());

-- Criar política para permitir SaaS admins criarem perfis
CREATE POLICY "SaaS admins can create profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (is_saas_admin_for_company_management());

-- Criar política para permitir SaaS admins deletarem perfis
CREATE POLICY "SaaS admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (is_saas_admin_for_company_management());

-- Criar política para SaaS admins verem todos os convites
CREATE POLICY "SaaS admins can view all invitations"
  ON public.user_invitations
  FOR SELECT
  USING (is_saas_admin_for_company_management());

-- Criar política para SaaS admins gerenciarem todos os convites
CREATE POLICY "SaaS admins can manage all invitations"
  ON public.user_invitations
  FOR ALL
  USING (is_saas_admin_for_company_management());