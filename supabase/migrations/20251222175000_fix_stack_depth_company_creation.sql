-- Fix infinite recursion stack depth limit exceeded by enforcing SECURITY DEFINER
-- on trigger functions and helper functions used during company creation.

-- Update create_default_pipeline_columns to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deletar colunas existentes para recriar com ordem correta
  DELETE FROM public.pipeline_columns WHERE company_id = target_company_id;
  
  -- Inserir colunas na ordem correta com os novos status
  INSERT INTO public.pipeline_columns (name, color, position, company_id, is_protected) VALUES
    ('Novo Lead', '#6B7280', 0, target_company_id, true),
    ('Atendimento', '#3B82F6', 1, target_company_id, true),
    ('Agendamento', '#F59E0B', 2, target_company_id, true),
    ('Reagendamento', '#FB923C', 3, target_company_id, true),
    ('No Show', '#EF4444', 4, target_company_id, true),
    ('Follow up', '#8B5CF6', 5, target_company_id, true),
    ('Negociação', '#06B6D4', 6, target_company_id, true),
    ('Vendido', '#10B981', 7, target_company_id, true),
    ('Perdido', '#DC2626', 8, target_company_id, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Update create_default_roles_for_company to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_default_roles_for_company(target_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Função permanece vazia conforme definição anterior, apenas garantindo SECURITY DEFINER
  NULL;
END;
$$;

-- Update handle_new_company to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar cargos padrão para a nova empresa
  PERFORM public.create_default_roles_for_company(NEW.id);
  
  -- Criar colunas padrão do pipeline para a empresa
  PERFORM public.create_default_pipeline_columns(NEW.id);
  
  RETURN NEW;
END;
$$;
