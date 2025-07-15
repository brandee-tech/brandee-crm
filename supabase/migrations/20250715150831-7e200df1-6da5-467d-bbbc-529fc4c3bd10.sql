-- Finalizar migração atualizando funções restantes
CREATE OR REPLACE FUNCTION public.setup_company_admin(user_id UUID, company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Buscar o role de Admin do sistema
  SELECT id INTO admin_role_id 
  FROM public.roles 
  WHERE name = 'Admin' 
    AND is_system_role = true 
    AND company_id IS NULL
  LIMIT 1;
  
  -- Atualizar o perfil do usuário
  UPDATE public.profiles 
  SET company_id = setup_company_admin.company_id, 
      role_id = admin_role_id
  WHERE id = setup_company_admin.user_id;
END;
$$;