
-- Criar função para verificar se usuário é admin SaaS
CREATE OR REPLACE FUNCTION public.is_saas_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() 
    AND r.name = 'Administrador do Sistema'
  );
$function$;

-- Criar função para obter métricas globais do SaaS
CREATE OR REPLACE FUNCTION public.get_saas_metrics()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT json_build_object(
    'total_companies', (SELECT COUNT(*) FROM public.companies),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_companies', (SELECT COUNT(*) FROM public.companies WHERE created_at > now() - interval '30 days'),
    'new_users_this_month', (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '30 days'),
    'companies_by_plan', (
      SELECT json_object_agg(plan, count)
      FROM (
        SELECT COALESCE(plan, 'basic') as plan, COUNT(*) as count
        FROM public.companies
        GROUP BY plan
      ) as plan_counts
    )
  );
$function$;

-- Criar view para dados de empresas com estatísticas
CREATE OR REPLACE VIEW public.admin_companies_view AS
SELECT 
  c.*,
  (SELECT COUNT(*) FROM public.profiles p WHERE p.company_id = c.id) as user_count,
  (SELECT COUNT(*) FROM public.leads l WHERE l.company_id = c.id) as leads_count,
  (SELECT COUNT(*) FROM public.appointments a WHERE a.company_id = c.id) as appointments_count
FROM public.companies c;

-- Permitir que admins SaaS vejam todos os dados
CREATE POLICY "SaaS admins can view all companies" 
  ON public.companies 
  FOR SELECT 
  TO authenticated 
  USING (public.is_saas_admin());

CREATE POLICY "SaaS admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (public.is_saas_admin());

CREATE POLICY "SaaS admins can update companies" 
  ON public.companies 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_saas_admin());
