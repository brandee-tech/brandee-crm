-- FASE 1: Sistema de Perfis e Empresas
-- Criar trigger automático para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FASE 4: Sistema de Roles Básico
-- Criar roles padrão do sistema se não existirem
INSERT INTO public.roles (name, description, is_system_role, company_id) VALUES
('Admin', 'Administrador da empresa com acesso completo', true, null),
('SDR', 'Sales Development Representative - Geração de leads', true, null),
('Closer', 'Fechador de vendas - Conversão de leads', true, null)
ON CONFLICT DO NOTHING;

-- Função para associar usuário a empresa e definir como admin
CREATE OR REPLACE FUNCTION public.setup_company_admin(user_id UUID, company_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Buscar o role de Admin
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Admin' AND is_system_role = true LIMIT 1;
  
  -- Atualizar o perfil do usuário
  UPDATE public.profiles 
  SET company_id = setup_company_admin.company_id, 
      role_id = admin_role_id
  WHERE id = setup_company_admin.user_id;
  
  -- Criar colunas padrão do pipeline para a empresa
  PERFORM public.create_default_pipeline_columns(setup_company_admin.company_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter informações do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  company_id UUID,
  company_name TEXT,
  role_name TEXT,
  has_company BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.company_id,
    c.name as company_name,
    r.name as role_name,
    (p.company_id IS NOT NULL) as has_company
  FROM public.profiles p
  LEFT JOIN public.companies c ON p.company_id = c.id
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;