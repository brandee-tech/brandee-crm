-- Remover todas as políticas existentes da tabela user_invitations para evitar conflitos
DROP POLICY IF EXISTS "Admins can create invitations for their company" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can view invitations from their company" ON public.user_invitations;
DROP POLICY IF EXISTS "Company admins can create invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Company admins can delete invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Company admins can update invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Company admins can view invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "SaaS admins can create invitations for any company" ON public.user_invitations;
DROP POLICY IF EXISTS "SaaS admins can delete invitations for any company" ON public.user_invitations;
DROP POLICY IF EXISTS "SaaS admins can update invitations for any company" ON public.user_invitations;

-- Recriar políticas de forma organizada e sem conflitos

-- Políticas para SaaS Admins (acesso total a todos os convites)
CREATE POLICY "SaaS admins can view all invitations"
  ON public.user_invitations
  FOR SELECT
  USING (is_saas_admin_for_company_management());

CREATE POLICY "SaaS admins can create invitations for any company"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (is_saas_admin_for_company_management());

CREATE POLICY "SaaS admins can update invitations for any company"
  ON public.user_invitations
  FOR UPDATE
  USING (is_saas_admin_for_company_management());

CREATE POLICY "SaaS admins can delete invitations for any company"
  ON public.user_invitations
  FOR DELETE
  USING (is_saas_admin_for_company_management());

-- Políticas para Company Admins (acesso apenas à sua empresa)
CREATE POLICY "Company admins can view their company invitations"
  ON public.user_invitations
  FOR SELECT
  USING (company_id = get_current_user_company_id() AND is_current_user_admin());

CREATE POLICY "Company admins can create invitations for their company"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id() AND is_current_user_admin());

CREATE POLICY "Company admins can update their company invitations"
  ON public.user_invitations
  FOR UPDATE
  USING (company_id = get_current_user_company_id() AND is_current_user_admin());

CREATE POLICY "Company admins can delete their company invitations"
  ON public.user_invitations
  FOR DELETE
  USING (company_id = get_current_user_company_id() AND is_current_user_admin());