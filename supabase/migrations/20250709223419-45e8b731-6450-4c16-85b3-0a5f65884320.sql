-- Adicionar coluna is_protected às pipeline_columns
ALTER TABLE public.pipeline_columns 
ADD COLUMN is_protected boolean NOT NULL DEFAULT false;

-- Marcar as 5 colunas padrão como protegidas
UPDATE public.pipeline_columns 
SET is_protected = true 
WHERE name IN ('Novo Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado');

-- Corrigir função para sincronizar leads com pipeline (usar primeira coluna por posição)
CREATE OR REPLACE FUNCTION public.sync_lead_status_with_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  lead_record RECORD;
  first_column_name TEXT;
BEGIN
  -- Para cada empresa, buscar a primeira coluna do pipeline como status padrão
  FOR lead_record IN 
    SELECT DISTINCT l.company_id, pc.name as first_column
    FROM leads l
    JOIN pipeline_columns pc ON pc.company_id = l.company_id
    WHERE pc.position = (
      SELECT MIN(position) FROM pipeline_columns 
      WHERE company_id = l.company_id
    )
  LOOP
    -- Atualizar leads sem status válido para primeira coluna
    UPDATE leads 
    SET status = lead_record.first_column
    WHERE company_id = lead_record.company_id 
    AND (status IS NULL OR status NOT IN (
      SELECT name FROM pipeline_columns WHERE company_id = lead_record.company_id
    ));
    
    -- Atualizar leads com agendamento para coluna "Agendado" se existir
    UPDATE leads 
    SET status = (
      SELECT name FROM pipeline_columns 
      WHERE company_id = lead_record.company_id 
      AND name ILIKE '%agend%' 
      ORDER BY position
      LIMIT 1
    )
    WHERE company_id = lead_record.company_id 
    AND id IN (
      SELECT DISTINCT lead_id 
      FROM appointments 
      WHERE company_id = lead_record.company_id 
      AND lead_id IS NOT NULL
    )
    AND EXISTS (
      SELECT 1 FROM pipeline_columns 
      WHERE company_id = lead_record.company_id 
      AND name ILIKE '%agend%'
    );
  END LOOP;
END;
$function$;

-- Executar sincronização para corrigir leads existentes
SELECT sync_lead_status_with_pipeline();

-- Atualizar função create_default_pipeline_columns para marcar como protegidas
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.pipeline_columns (name, color, position, company_id, is_protected) VALUES
    ('Novo Lead', '#EF4444', 0, target_company_id, true),
    ('Qualificado', '#F59E0B', 1, target_company_id, true),
    ('Proposta', '#3B82F6', 2, target_company_id, true),
    ('Negociação', '#8B5CF6', 3, target_company_id, true),
    ('Fechado', '#10B981', 4, target_company_id, true)
  ON CONFLICT DO NOTHING;
END;
$function$;