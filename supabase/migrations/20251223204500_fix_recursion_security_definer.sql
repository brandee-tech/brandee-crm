-- Fix recursion by enforcing SECURITY DEFINER on helper functions
-- This allows them to bypass RLS when checking permissions

-- 1. Updates get_current_user_company_id
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Direct lookup bypassing RLS thanks to SECURITY DEFINER
  RETURN (
    SELECT company_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- 2. Updates is_saas_admin
CREATE OR REPLACE FUNCTION public.is_saas_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Direct lookup bypassing RLS thanks to SECURITY DEFINER
  RETURN COALESCE((
    SELECT is_super_admin 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
END;
$$;

-- 3. Updates is_current_user_admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_name text;
  is_super boolean;
BEGIN
  -- Check super admin first
  SELECT is_super_admin INTO is_super
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF is_super = true THEN
    RETURN true;
  END IF;
  
  -- Check company admin role
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Admin roles list
  RETURN user_role_name IN (
    'Admin', 'Administrador', 'Gerente'
  );
END;
$$;
