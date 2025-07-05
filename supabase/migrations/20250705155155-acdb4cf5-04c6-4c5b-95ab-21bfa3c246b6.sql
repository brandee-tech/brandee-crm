-- Corrigir função is_current_user_admin para reconhecer roles em português
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  user_role_name text;
BEGIN
  -- Get the current user's role name
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Check if the role is admin (include both English and Portuguese names)
  RETURN user_role_name IN (
    'Admin', 'Super Admin', 'SaaS Admin', 'System Admin',
    'Administrador do Sistema', 'Administrador', 'Admin SaaS'
  );
END;
$$;