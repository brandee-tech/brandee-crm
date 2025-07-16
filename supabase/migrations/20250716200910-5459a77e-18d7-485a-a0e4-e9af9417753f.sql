-- Criar função melhorada para sincronizar status do lead com agendamentos
CREATE OR REPLACE FUNCTION public.sync_lead_status_on_appointment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_status TEXT;
  lead_company_id UUID;
BEGIN
  -- Se não há lead_id, não faz nada
  IF NEW.lead_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obter company_id do lead para buscar as colunas do pipeline
  SELECT company_id INTO lead_company_id
  FROM leads 
  WHERE id = NEW.lead_id;

  -- Mapear status do agendamento para status do pipeline
  CASE NEW.status
    WHEN 'Scheduled' THEN
      SELECT name INTO target_status
      FROM pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'Agendamento' 
      LIMIT 1;
    
    WHEN 'Completed' THEN
      SELECT name INTO target_status
      FROM pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'Atendimento' 
      LIMIT 1;
    
    WHEN 'No Show' THEN
      SELECT name INTO target_status
      FROM pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'No Show' 
      LIMIT 1;
    
    WHEN 'Rescheduled' THEN
      SELECT name INTO target_status
      FROM pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'Reagendamento' 
      LIMIT 1;
    
    WHEN 'Cancelled' THEN
      -- Manter status atual, não alterar
      target_status := NULL;
    
    ELSE
      target_status := NULL;
  END CASE;

  -- Atualizar status do lead se encontrou um status válido
  IF target_status IS NOT NULL THEN
    UPDATE leads 
    SET status = target_status, updated_at = now()
    WHERE id = NEW.lead_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Criar função para sincronizar status do lead com follow-ups
CREATE OR REPLACE FUNCTION public.sync_lead_status_on_followup_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_status TEXT;
  lead_id_from_appointment UUID;
  lead_company_id UUID;
BEGIN
  -- Obter lead_id do agendamento relacionado ao follow-up
  SELECT a.lead_id, a.company_id INTO lead_id_from_appointment, lead_company_id
  FROM appointments a 
  WHERE a.id = NEW.appointment_id;

  -- Se não há lead relacionado, não faz nada
  IF lead_id_from_appointment IS NULL THEN
    RETURN NEW;
  END IF;

  -- Se follow-up foi criado e não está completo, mover para Follow up
  IF TG_OP = 'INSERT' AND (NEW.completed = false OR NEW.completed IS NULL) THEN
    SELECT name INTO target_status
    FROM pipeline_columns 
    WHERE company_id = lead_company_id 
    AND name = 'Follow up' 
    LIMIT 1;
    
    IF target_status IS NOT NULL THEN
      UPDATE leads 
      SET status = target_status, updated_at = now()
      WHERE id = lead_id_from_appointment;
    END IF;
  END IF;

  -- Se follow-up foi completado, analisar resultado
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    CASE NEW.result
      WHEN 'Agendou nova reunião' THEN
        SELECT name INTO target_status
        FROM pipeline_columns 
        WHERE company_id = lead_company_id 
        AND name = 'Agendamento' 
        LIMIT 1;
      
      WHEN 'Interessado - continuar follow-up' THEN
        SELECT name INTO target_status
        FROM pipeline_columns 
        WHERE company_id = lead_company_id 
        AND name = 'Negociação' 
        LIMIT 1;
      
      WHEN 'Não interessado' THEN
        SELECT name INTO target_status
        FROM pipeline_columns 
        WHERE company_id = lead_company_id 
        AND name = 'Perdido' 
        LIMIT 1;
      
      WHEN 'Fechou venda' THEN
        SELECT name INTO target_status
        FROM pipeline_columns 
        WHERE company_id = lead_company_id 
        AND name = 'Vendido' 
        LIMIT 1;
      
      ELSE
        target_status := NULL;
    END CASE;

    IF target_status IS NOT NULL THEN
      UPDATE leads 
      SET status = target_status, updated_at = now()
      WHERE id = lead_id_from_appointment;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Criar função para sincronizar quando lead é movido manualmente no pipeline
CREATE OR REPLACE FUNCTION public.sync_related_data_on_lead_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Se status mudou para "Vendido", calcular receita
  IF NEW.status = 'Vendido' AND OLD.status != 'Vendido' THEN
    NEW.revenue_generated := COALESCE(NEW.product_value, 0);
    NEW.revenue_lost := 0;
  END IF;

  -- Se status mudou para "Perdido", calcular receita perdida
  IF NEW.status = 'Perdido' AND OLD.status != 'Perdido' THEN
    NEW.revenue_lost := COALESCE(NEW.product_value, 0);
    NEW.revenue_generated := 0;
  END IF;

  -- Se saiu de "Vendido" ou "Perdido", zerar receitas
  IF OLD.status IN ('Vendido', 'Perdido') AND NEW.status NOT IN ('Vendido', 'Perdido') THEN
    NEW.revenue_generated := 0;
    NEW.revenue_lost := 0;
  END IF;

  RETURN NEW;
END;
$function$;

-- Remover triggers existentes se existirem
DROP TRIGGER IF EXISTS sync_appointment_status_with_lead ON appointments;
DROP TRIGGER IF EXISTS sync_followup_status_with_lead ON follow_ups;
DROP TRIGGER IF EXISTS sync_lead_revenue_on_status_change ON leads;

-- Criar triggers para sincronização automática
CREATE TRIGGER sync_appointment_status_with_lead
  AFTER INSERT OR UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_lead_status_on_appointment_change();

CREATE TRIGGER sync_followup_status_with_lead
  AFTER INSERT OR UPDATE OF completed, result ON follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION sync_lead_status_on_followup_change();

CREATE TRIGGER sync_lead_revenue_on_status_change
  BEFORE UPDATE OF status ON leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_related_data_on_lead_status_change();