-- Remover a política problemática que está causando recursão infinita
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;

-- Criar função para obter o company_id do usuário atual sem recursão
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Criar nova política sem recursão usando a função
CREATE POLICY "Users can view profiles from their company"
ON public.profiles
FOR SELECT
TO authenticated
USING (company_id = public.get_current_user_company_id());