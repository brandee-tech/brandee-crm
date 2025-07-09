-- Função para sincronizar status dos leads com colunas do pipeline
CREATE OR REPLACE FUNCTION sync_lead_status_with_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_record RECORD;
  first_column_name TEXT;
BEGIN
  -- Para cada empresa, buscar a primeira coluna do pipeline como status padrão
  FOR lead_record IN 
    SELECT DISTINCT l.company_id, pc.name as first_column
    FROM leads l
    JOIN pipeline_columns pc ON pc.company_id = l.company_id
    WHERE pc.position = 0
  LOOP
    -- Atualizar leads sem agendamento para primeira coluna (Novo Lead)
    UPDATE leads 
    SET status = lead_record.first_column
    WHERE company_id = lead_record.company_id 
    AND status NOT IN (
      SELECT name FROM pipeline_columns WHERE company_id = lead_record.company_id
    );
    
    -- Atualizar leads com agendamento para coluna "Agendado" se existir
    UPDATE leads 
    SET status = (
      SELECT name FROM pipeline_columns 
      WHERE company_id = lead_record.company_id 
      AND name ILIKE '%agend%' 
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
$$;

-- Executar a sincronização
SELECT sync_lead_status_with_pipeline();

-- Trigger para atualizar status do lead automaticamente quando criar agendamento
CREATE OR REPLACE FUNCTION update_lead_status_on_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  agendado_column_name TEXT;
BEGIN
  -- Buscar coluna que representa "Agendado"
  SELECT name INTO agendado_column_name
  FROM pipeline_columns 
  WHERE company_id = NEW.company_id 
  AND name ILIKE '%agend%' 
  ORDER BY position 
  LIMIT 1;
  
  -- Se encontrou a coluna e o agendamento tem lead_id, atualizar status
  IF agendado_column_name IS NOT NULL AND NEW.lead_id IS NOT NULL THEN
    UPDATE leads 
    SET status = agendado_column_name 
    WHERE id = NEW.lead_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para agendamentos
DROP TRIGGER IF EXISTS trigger_update_lead_status_on_appointment ON appointments;
CREATE TRIGGER trigger_update_lead_status_on_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status_on_appointment();

-- Trigger para atualizar status do lead quando criar follow-up
CREATE OR REPLACE FUNCTION update_lead_status_on_followup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  followup_column_name TEXT;
  lead_id_from_appointment UUID;
BEGIN
  -- Buscar lead_id do agendamento relacionado ao follow-up
  SELECT lead_id INTO lead_id_from_appointment
  FROM appointments 
  WHERE id = NEW.appointment_id;
  
  -- Se encontrou um lead, buscar coluna de follow-up
  IF lead_id_from_appointment IS NOT NULL THEN
    SELECT name INTO followup_column_name
    FROM pipeline_columns 
    WHERE company_id = NEW.company_id 
    AND name ILIKE '%follow%' 
    ORDER BY position 
    LIMIT 1;
    
    -- Atualizar status do lead se encontrou a coluna
    IF followup_column_name IS NOT NULL THEN
      UPDATE leads 
      SET status = followup_column_name 
      WHERE id = lead_id_from_appointment;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para follow-ups
DROP TRIGGER IF EXISTS trigger_update_lead_status_on_followup ON follow_ups;
CREATE TRIGGER trigger_update_lead_status_on_followup
  AFTER INSERT ON follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status_on_followup();