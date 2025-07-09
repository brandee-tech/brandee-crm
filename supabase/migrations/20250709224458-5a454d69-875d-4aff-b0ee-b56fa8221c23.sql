-- Atualizar função para garantir que "Novo Lead" seja sempre a primeira coluna
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Deletar colunas existentes para recriar com ordem correta
  DELETE FROM public.pipeline_columns WHERE company_id = target_company_id;
  
  -- Inserir colunas na ordem correta, sempre começando com "Novo Lead"
  INSERT INTO public.pipeline_columns (name, color, position, company_id, is_protected) VALUES
    ('Novo Lead', '#EF4444', 0, target_company_id, true),
    ('Qualificado', '#F59E0B', 1, target_company_id, true),
    ('Proposta', '#3B82F6', 2, target_company_id, true),
    ('Negociação', '#8B5CF6', 3, target_company_id, true),
    ('Fechado', '#10B981', 4, target_company_id, true)
  ON CONFLICT DO NOTHING;
END;
$function$;

-- Garantir que todas as empresas existentes tenham "Novo Lead" como primeira coluna
DO $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN 
        SELECT DISTINCT id FROM companies
    LOOP
        -- Verificar se a empresa tem colunas do pipeline
        IF NOT EXISTS (SELECT 1 FROM pipeline_columns WHERE company_id = company_record.id) THEN
            -- Se não tem, criar as colunas padrão
            PERFORM create_default_pipeline_columns(company_record.id);
        ELSE
            -- Se tem, verificar se a primeira coluna é "Novo Lead"
            IF NOT EXISTS (
                SELECT 1 FROM pipeline_columns 
                WHERE company_id = company_record.id 
                AND name = 'Novo Lead' 
                AND position = 0
            ) THEN
                -- Se não é "Novo Lead" na posição 0, recriar as colunas
                DELETE FROM pipeline_columns WHERE company_id = company_record.id;
                PERFORM create_default_pipeline_columns(company_record.id);
            END IF;
        END IF;
    END LOOP;
END $$;

-- Atualizar todos os leads para usar "Novo Lead" como status padrão
UPDATE leads 
SET status = 'Novo Lead' 
WHERE status IS NULL 
   OR status NOT IN (
       SELECT name FROM pipeline_columns 
       WHERE company_id = leads.company_id
   );