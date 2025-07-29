-- Update the update_goal_progress function to work without start_date and end_date
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  goal_record RECORD;
  period_start DATE;
  period_end DATE;
  current_date_val DATE := CURRENT_DATE;
BEGIN
  -- Process each active goal individually
  FOR goal_record IN 
    SELECT id, user_id, company_id, goal_type, period, target_value
    FROM public.user_goals 
    WHERE status = 'ativa'
  LOOP
    -- Calculate period dates based on goal period
    CASE goal_record.period
      WHEN 'mensal' THEN
        period_start := date_trunc('month', current_date_val)::DATE;
        period_end := (date_trunc('month', current_date_val) + interval '1 month' - interval '1 day')::DATE;
      WHEN 'trimestral' THEN
        period_start := date_trunc('quarter', current_date_val)::DATE;
        period_end := (date_trunc('quarter', current_date_val) + interval '3 months' - interval '1 day')::DATE;
      WHEN 'anual' THEN
        period_start := date_trunc('year', current_date_val)::DATE;
        period_end := (date_trunc('year', current_date_val) + interval '1 year' - interval '1 day')::DATE;
      ELSE
        -- Default to monthly if period is not recognized
        period_start := date_trunc('month', current_date_val)::DATE;
        period_end := (date_trunc('month', current_date_val) + interval '1 month' - interval '1 day')::DATE;
    END CASE;

    -- Update goal based on type
    CASE goal_record.goal_type
      WHEN 'vendas' THEN
        UPDATE public.user_goals 
        SET current_value = (
          SELECT COUNT(*)
          FROM public.leads l
          WHERE l.assigned_to = goal_record.user_id
          AND l.status = 'Vendido'
          AND l.updated_at::DATE >= period_start
          AND l.updated_at::DATE <= period_end
          AND l.company_id = goal_record.company_id
        )
        WHERE id = goal_record.id;

      WHEN 'receita' THEN
        UPDATE public.user_goals 
        SET current_value = (
          SELECT COALESCE(SUM(l.product_value), 0)
          FROM public.leads l
          WHERE l.assigned_to = goal_record.user_id
          AND l.status = 'Vendido'
          AND l.updated_at::DATE >= period_start
          AND l.updated_at::DATE <= period_end
          AND l.company_id = goal_record.company_id
        )
        WHERE id = goal_record.id;

      WHEN 'agendamentos' THEN
        UPDATE public.user_goals 
        SET current_value = (
          SELECT COUNT(*)
          FROM public.appointments a
          WHERE a.assigned_to = goal_record.user_id
          AND a.created_at::DATE >= period_start
          AND a.created_at::DATE <= period_end
          AND a.company_id = goal_record.company_id
        )
        WHERE id = goal_record.id;

      WHEN 'conversoes' THEN
        -- Conversions could be defined as leads that moved from initial status to "Vendido"
        UPDATE public.user_goals 
        SET current_value = (
          SELECT COUNT(*)
          FROM public.leads l
          WHERE l.assigned_to = goal_record.user_id
          AND l.status = 'Vendido'
          AND l.updated_at::DATE >= period_start
          AND l.updated_at::DATE <= period_end
          AND l.company_id = goal_record.company_id
        )
        WHERE id = goal_record.id;
    END CASE;
  END LOOP;

  -- Mark goals as completed if they reached the target
  UPDATE public.user_goals 
  SET status = 'concluida'
  WHERE current_value >= target_value 
  AND status = 'ativa';
END;
$$;