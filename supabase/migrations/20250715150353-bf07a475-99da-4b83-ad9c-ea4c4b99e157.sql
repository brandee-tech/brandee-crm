-- Migração para centralizar cargos no sistema e eliminar duplicações

-- 1. Primeiro, criar cargos padrão do sistema se não existirem
DO $$
BEGIN
  -- Verificar e criar role Admin do sistema
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Admin' AND is_system_role = true) THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) 
    VALUES ('Admin', 'Administrador da empresa com acesso completo', true, null, '{}'::jsonb);
  END IF;

  -- Verificar e criar role SDR do sistema
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'SDR' AND is_system_role = true) THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) 
    VALUES ('SDR', 'Sales Development Representative - Geração de leads', true, null, '{}'::jsonb);
  END IF;

  -- Verificar e criar role Closer do sistema
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Closer' AND is_system_role = true) THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) 
    VALUES ('Closer', 'Fechador de vendas - Conversão de leads', true, null, '{}'::jsonb);
  END IF;

  -- Verificar e criar role Gerente do sistema
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Gerente' AND is_system_role = true) THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) 
    VALUES ('Gerente', 'Gerente com permissões administrativas', true, null, '{}'::jsonb);
  END IF;
END $$;

-- 2. Migrar usuários de roles de empresa para roles do sistema
DO $$
DECLARE
  profile_record RECORD;
  system_role_id UUID;
BEGIN
  -- Para cada perfil que tem um role de empresa
  FOR profile_record IN 
    SELECT p.id, p.role_id, r.name as role_name
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE r.is_system_role = false AND r.company_id IS NOT NULL
  LOOP
    -- Buscar o role do sistema equivalente
    SELECT id INTO system_role_id
    FROM public.roles
    WHERE name = profile_record.role_name
    AND is_system_role = true
    AND company_id IS NULL
    LIMIT 1;
    
    -- Se encontrou o role do sistema, atualizar o perfil
    IF system_role_id IS NOT NULL THEN
      UPDATE public.profiles
      SET role_id = system_role_id
      WHERE id = profile_record.id;
    END IF;
  END LOOP;
END $$;

-- 3. Remover roles de empresa duplicados que não estão mais sendo usados
DELETE FROM public.roles 
WHERE is_system_role = false 
AND company_id IS NOT NULL
AND id NOT IN (SELECT DISTINCT role_id FROM public.profiles WHERE role_id IS NOT NULL);

-- 4. Atualizar políticas RLS para roles
DROP POLICY IF EXISTS "Users can create roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can update roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can delete roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can view their company roles" ON public.roles;

-- Nova política para visualizar apenas roles do sistema
CREATE POLICY "Users can view system roles" 
ON public.roles 
FOR SELECT 
USING (is_system_role = true);

-- Política para SaaS admins gerenciarem roles do sistema
CREATE POLICY "SaaS admins can manage system roles" 
ON public.roles 
FOR ALL 
USING (is_saas_admin() AND is_system_role = true)
WITH CHECK (is_saas_admin() AND is_system_role = true);