-- Fix stack depth limit exceeded caused by recursive RLS policies between companies/profiles

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public', 'auth'
AS $$
BEGIN
  RETURN (
    SELECT company_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Rebuild profiles policies to avoid any subselects on the same table
DROP POLICY IF EXISTS "Users can view their company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete users from their company" ON public.profiles;

CREATE POLICY "Users can view their company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR company_id = public.get_current_user_company_id()
  OR public.is_saas_admin()
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR (public.is_current_user_admin() AND company_id = public.get_current_user_company_id())
  OR public.is_saas_admin()
)
WITH CHECK (
  id = auth.uid()
  OR (public.is_current_user_admin() AND company_id = public.get_current_user_company_id())
  OR public.is_saas_admin()
);

CREATE POLICY "Admins can delete users from their company"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  (
    public.is_current_user_admin()
    AND company_id = public.get_current_user_company_id()
    AND id <> auth.uid()
  )
  OR (
    public.is_saas_admin()
    AND id <> auth.uid()
  )
);

-- Rebuild companies policies to avoid depending on RLS-protected lookups
DROP POLICY IF EXISTS "Users can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "SaaS admins can view all company data for admin view" ON public.companies;
DROP POLICY IF EXISTS "Only SaaS admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Only SaaS admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Only SaaS admins can create companies" ON public.companies;

CREATE POLICY "Users can view their company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id = public.get_current_user_company_id()
  OR public.is_saas_admin()
);

CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = public.get_current_user_company_id()
  OR public.is_saas_admin()
)
WITH CHECK (
  id = public.get_current_user_company_id()
  OR public.is_saas_admin()
);

CREATE POLICY "SaaS admins can delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (public.is_saas_admin());

