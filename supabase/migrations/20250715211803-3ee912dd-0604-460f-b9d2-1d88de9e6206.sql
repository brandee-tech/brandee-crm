-- Corrigir a função get_current_user_company_id para evitar recursão RLS
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Buscar diretamente na tabela profiles sem depender de RLS
  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Corrigir as políticas RLS da tabela leads para usar a função corretamente
DROP POLICY IF EXISTS "Admins can view all company leads" ON public.leads;
DROP POLICY IF EXISTS "Closers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads for their company" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their company leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their company leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update lead assignments" ON public.leads;

-- Recriar políticas usando a função segura
CREATE POLICY "Users can view their company leads"
ON public.leads
FOR SELECT
TO authenticated
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can create leads for their company"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update their company leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete their company leads"
ON public.leads
FOR DELETE
TO authenticated
USING (company_id = public.get_current_user_company_id());