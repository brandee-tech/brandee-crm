
-- Atualizar função para criar colunas padrão do pipeline com os novos status
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Recriar colunas padrão para todas as empresas existentes
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN SELECT id FROM public.companies
  LOOP
    PERFORM public.create_default_pipeline_columns(company_record.id);
  END LOOP;
END
$$;

-- Atualizar leads existentes para usar status válidos
UPDATE public.leads 
SET status = 'Novo Lead' 
WHERE status IS NULL 
   OR status NOT IN ('Novo Lead', 'Atendimento', 'Agendamento', 'Reagendamento', 'No Show', 'Follow up', 'Negociação', 'Vendido', 'Perdido');

-- Função para sincronizar status do lead com pipeline quando status muda
CREATE OR REPLACE FUNCTION public.sync_lead_status_with_pipeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Garantir que o status do lead é válido
  IF NEW.status NOT IN ('Novo Lead', 'Atendimento', 'Agendamento', 'Reagendamento', 'No Show', 'Follow up', 'Negociação', 'Vendido', 'Perdido') THEN
    NEW.status := 'Novo Lead';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para validar status do lead
DROP TRIGGER IF EXISTS validate_lead_status ON public.leads;
CREATE TRIGGER validate_lead_status
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_status_with_pipeline();
