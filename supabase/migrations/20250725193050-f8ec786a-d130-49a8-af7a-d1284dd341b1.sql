-- Fix search path security vulnerabilities in all database functions
-- This prevents search path attacks and privilege escalation

-- 1. Fix get_current_user_company_id function
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
BEGIN
  -- Buscar diretamente na tabela profiles sem depender de RLS
  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- 2. Fix get_advanced_saas_analytics function
CREATE OR REPLACE FUNCTION public.get_advanced_saas_analytics(period_days integer DEFAULT 30, company_filter uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Verificar se é admin SaaS
  IF NOT public.is_saas_admin() THEN
    RAISE EXCEPTION 'Access denied. SaaS admin privileges required.';
  END IF;

  SELECT json_build_object(
    'overview', json_build_object(
      'total_companies', (
        SELECT COUNT(*) FROM public.companies 
        WHERE (company_filter IS NULL OR id = company_filter)
      ),
      'total_users', (
        SELECT COUNT(*) FROM public.profiles p
        JOIN public.companies c ON p.company_id = c.id
        WHERE (company_filter IS NULL OR c.id = company_filter)
      ),
      'active_companies', (
        SELECT COUNT(DISTINCT c.id) FROM public.companies c
        JOIN public.profiles p ON p.company_id = c.id
        WHERE p.updated_at > now() - (period_days || ' days')::interval
        AND (company_filter IS NULL OR c.id = company_filter)
      ),
      'new_users_this_period', (
        SELECT COUNT(*) FROM public.profiles p
        JOIN public.companies c ON p.company_id = c.id
        WHERE p.created_at > now() - (period_days || ' days')::interval
        AND (company_filter IS NULL OR c.id = company_filter)
      )
    ),
    'companies', json_build_object(
      'by_plan', (
        SELECT COALESCE(json_object_agg(plan, count), '{}')
        FROM (
          SELECT COALESCE(plan, 'basic') as plan, COUNT(*) as count
          FROM public.companies
          WHERE (company_filter IS NULL OR id = company_filter)
          GROUP BY plan
        ) as plan_counts
      ),
      'by_industry', (
        SELECT COALESCE(json_object_agg(industry, count), '{}')
        FROM (
          SELECT COALESCE(industry, 'Não informado') as industry, COUNT(*) as count
          FROM public.companies
          WHERE (company_filter IS NULL OR id = company_filter)
          GROUP BY industry
        ) as industry_counts
      ),
      'by_size', (
        SELECT COALESCE(json_object_agg(size, count), '{}')
        FROM (
          SELECT COALESCE(size, 'Não informado') as size, COUNT(*) as count
          FROM public.companies
          WHERE (company_filter IS NULL OR id = company_filter)
          GROUP BY size
        ) as size_counts
      ),
      'growth', (
        SELECT COALESCE(json_agg(json_build_object('date', date, 'count', count) ORDER BY date), '[]')
        FROM (
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM public.companies
          WHERE created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR id = company_filter)
          GROUP BY DATE(created_at)
        ) as growth_data
      )
    ),
    'users', json_build_object(
      'by_role', (
        SELECT COALESCE(json_object_agg(role_name, count), '{}')
        FROM (
          SELECT COALESCE(r.name, 'Sem cargo') as role_name, COUNT(*) as count
          FROM public.profiles p
          LEFT JOIN public.roles r ON p.role_id = r.id
          JOIN public.companies c ON p.company_id = c.id
          WHERE (company_filter IS NULL OR c.id = company_filter)
          GROUP BY r.name
        ) as role_counts
      ),
      'growth', (
        SELECT COALESCE(json_agg(json_build_object('date', date, 'count', count) ORDER BY date), '[]')
        FROM (
          SELECT DATE(p.created_at) as date, COUNT(*) as count
          FROM public.profiles p
          JOIN public.companies c ON p.company_id = c.id
          WHERE p.created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR c.id = company_filter)
          GROUP BY DATE(p.created_at)
        ) as user_growth
      )
    ),
    'activities', json_build_object(
      'leads', json_build_object(
        'total', (
          SELECT COUNT(*) FROM public.leads l
          JOIN public.companies c ON l.company_id = c.id
          WHERE l.created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR c.id = company_filter)
        ),
        'by_status', (
          SELECT COALESCE(json_object_agg(status, count), '{}')
          FROM (
            SELECT COALESCE(l.status, 'Sem status') as status, COUNT(*) as count
            FROM public.leads l
            JOIN public.companies c ON l.company_id = c.id
            WHERE l.created_at > now() - (period_days || ' days')::interval
            AND (company_filter IS NULL OR c.id = company_filter)
            GROUP BY l.status
          ) as lead_status
        )
      ),
      'appointments', json_build_object(
        'total', (
          SELECT COUNT(*) FROM public.appointments a
          JOIN public.companies c ON a.company_id = c.id
          WHERE a.created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR c.id = company_filter)
        ),
        'by_status', (
          SELECT COALESCE(json_object_agg(status, count), '{}')
          FROM (
            SELECT COALESCE(a.status, 'Sem status') as status, COUNT(*) as count
            FROM public.appointments a
            JOIN public.companies c ON a.company_id = c.id
            WHERE a.created_at > now() - (period_days || ' days')::interval
            AND (company_filter IS NULL OR c.id = company_filter)
            GROUP BY a.status
          ) as appointment_status
        )
      ),
      'meetings', json_build_object(
        'total', (
          SELECT COUNT(*) FROM public.meetings m
          JOIN public.companies c ON m.company_id = c.id
          WHERE m.created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR c.id = company_filter)
        ),
        'by_status', (
          SELECT COALESCE(json_object_agg(status, count), '{}')
          FROM (
            SELECT COALESCE(m.status, 'Sem status') as status, COUNT(*) as count
            FROM public.meetings m
            JOIN public.companies c ON m.company_id = c.id
            WHERE m.created_at > now() - (period_days || ' days')::interval
            AND (company_filter IS NULL OR c.id = company_filter)
            GROUP BY m.status
          ) as meeting_status
        )
      ),
      'tasks', json_build_object(
        'total', (
          SELECT COUNT(*) FROM public.tasks t
          JOIN public.companies c ON t.company_id = c.id
          WHERE t.created_at > now() - (period_days || ' days')::interval
          AND (company_filter IS NULL OR c.id = company_filter)
        ),
        'by_status', (
          SELECT COALESCE(json_object_agg(status, count), '{}')
          FROM (
            SELECT COALESCE(t.status, 'Sem status') as status, COUNT(*) as count
            FROM public.tasks t
            JOIN public.companies c ON t.company_id = c.id
            WHERE t.created_at > now() - (period_days || ' days')::interval
            AND (company_filter IS NULL OR c.id = company_filter)
            GROUP BY t.status
          ) as task_status
        )
      )
    ),
    'top_companies', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', company_id,
          'name', company_name,
          'users_count', users_count,
          'leads_count', leads_count,
          'appointments_count', appointments_count,
          'activity_score', COALESCE(leads_count, 0) + COALESCE(appointments_count, 0) * 2 + COALESCE(users_count, 0)
        ) ORDER BY (COALESCE(leads_count, 0) + COALESCE(appointments_count, 0) * 2 + COALESCE(users_count, 0)) DESC
      ), '[]')
      FROM (
        SELECT 
          c.id as company_id,
          c.name as company_name,
          COUNT(DISTINCT p.id) as users_count,
          COUNT(DISTINCT l.id) as leads_count,
          COUNT(DISTINCT a.id) as appointments_count
        FROM public.companies c
        LEFT JOIN public.profiles p ON p.company_id = c.id AND p.created_at > now() - (period_days || ' days')::interval
        LEFT JOIN public.leads l ON l.company_id = c.id AND l.created_at > now() - (period_days || ' days')::interval
        LEFT JOIN public.appointments a ON a.company_id = c.id AND a.created_at > now() - (period_days || ' days')::interval
        WHERE (company_filter IS NULL OR c.id = company_filter)
        GROUP BY c.id, c.name
        HAVING COUNT(DISTINCT p.id) > 0 OR COUNT(DISTINCT l.id) > 0 OR COUNT(DISTINCT a.id) > 0
        LIMIT 10
      ) as company_stats
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- 3. Fix update_goal_progress function
CREATE OR REPLACE FUNCTION public.update_goal_progress()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Atualizar metas de vendas (leads com status "Vendido")
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COUNT(*)
    FROM public.leads l
    WHERE l.assigned_to = user_goals.user_id
    AND l.status = 'Vendido'
    AND l.updated_at >= user_goals.start_date
    AND l.updated_at <= user_goals.end_date
    AND l.company_id = user_goals.company_id
  )
  WHERE goal_type = 'vendas' AND status = 'ativa';

  -- Atualizar metas de receita (soma do valor dos produtos vendidos)
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COALESCE(SUM(l.product_value), 0)
    FROM public.leads l
    WHERE l.assigned_to = user_goals.user_id
    AND l.status = 'Vendido'
    AND l.updated_at >= user_goals.start_date
    AND l.updated_at <= user_goals.end_date
    AND l.company_id = user_goals.company_id
  )
  WHERE goal_type = 'receita' AND status = 'ativa';

  -- Atualizar metas de agendamentos
  UPDATE public.user_goals 
  SET current_value = (
    SELECT COUNT(*)
    FROM public.appointments a
    WHERE a.assigned_to = user_goals.user_id
    AND a.created_at >= user_goals.start_date
    AND a.created_at <= user_goals.end_date
    AND a.company_id = user_goals.company_id
  )
  WHERE goal_type = 'agendamentos' AND status = 'ativa';

  -- Marcar metas como concluídas se atingiram o target
  UPDATE public.user_goals 
  SET status = 'concluida'
  WHERE current_value >= target_value 
  AND status = 'ativa';
END;
$function$;

-- 4. Fix update_lead_status_on_appointment function
CREATE OR REPLACE FUNCTION public.update_lead_status_on_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  agendado_column_name TEXT;
BEGIN
  -- Buscar coluna que representa "Agendado"
  SELECT name INTO agendado_column_name
  FROM public.pipeline_columns 
  WHERE company_id = NEW.company_id 
  AND name ILIKE '%agend%' 
  ORDER BY position 
  LIMIT 1;
  
  -- Se encontrou a coluna e o agendamento tem lead_id, atualizar status
  IF agendado_column_name IS NOT NULL AND NEW.lead_id IS NOT NULL THEN
    UPDATE public.leads 
    SET status = agendado_column_name 
    WHERE id = NEW.lead_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Fix user_has_permission function
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_path text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
DECLARE
  user_permissions jsonb;
  permission_parts text[];
  current_level jsonb;
  part text;
BEGIN
  -- Buscar permissões do usuário atual
  SELECT r.permissions INTO user_permissions
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Se não encontrou permissões, retornar false
  IF user_permissions IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Dividir o caminho da permissão (ex: "students.view")
  permission_parts := string_to_array(permission_path, '.');
  current_level := user_permissions;
  
  -- Navegar pela estrutura de permissões
  FOREACH part IN ARRAY permission_parts
  LOOP
    current_level := current_level -> part;
    IF current_level IS NULL THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  -- Retornar o valor booleano final
  RETURN (current_level)::boolean;
END;
$function$;

-- 6. Fix is_saas_admin function
CREATE OR REPLACE FUNCTION public.is_saas_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
BEGIN
  RETURN COALESCE((
    SELECT is_super_admin 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
END;
$function$;

-- 7. Fix is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
DECLARE
  user_role_name text;
  is_super boolean;
BEGIN
  -- Verificar se é super admin primeiro
  SELECT is_super_admin INTO is_super
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF is_super = true THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de empresa
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Roles de admin de empresa (não incluir mais "Administrador do Sistema")
  RETURN user_role_name IN (
    'Admin', 'Administrador', 'Gerente'
  );
END;
$function$;

-- 8. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- 9. Fix setup_company_admin function
CREATE OR REPLACE FUNCTION public.setup_company_admin(user_id uuid, company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 10. Fix get_current_user_info function
CREATE OR REPLACE FUNCTION public.get_current_user_info()
 RETURNS TABLE(user_id uuid, email text, full_name text, company_id uuid, company_name text, role_name text, has_company boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'auth'
AS $function$
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
$function$;

-- 11. Fix other critical security definer functions
CREATE OR REPLACE FUNCTION public.update_lead_status_on_followup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  followup_column_name TEXT;
  lead_id_from_appointment UUID;
BEGIN
  -- Buscar lead_id do agendamento relacionado ao follow-up
  SELECT lead_id INTO lead_id_from_appointment
  FROM public.appointments 
  WHERE id = NEW.appointment_id;
  
  -- Se encontrou um lead, buscar coluna de follow-up
  IF lead_id_from_appointment IS NOT NULL THEN
    SELECT name INTO followup_column_name
    FROM public.pipeline_columns 
    WHERE company_id = NEW.company_id 
    AND name ILIKE '%follow%' 
    ORDER BY position 
    LIMIT 1;
    
    -- Atualizar status do lead se encontrou a coluna
    IF followup_column_name IS NOT NULL THEN
      UPDATE public.leads 
      SET status = followup_column_name 
      WHERE id = lead_id_from_appointment;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_lead_status_on_appointment_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
  FROM public.leads 
  WHERE id = NEW.lead_id;

  -- Mapear status do agendamento para status do pipeline
  CASE NEW.status
    WHEN 'Scheduled' THEN
      SELECT name INTO target_status
      FROM public.pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'Agendamento' 
      LIMIT 1;
    
    WHEN 'Completed' THEN
      SELECT name INTO target_status
      FROM public.pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'Atendimento' 
      LIMIT 1;
    
    WHEN 'No Show' THEN
      SELECT name INTO target_status
      FROM public.pipeline_columns 
      WHERE company_id = lead_company_id 
      AND name = 'No Show' 
      LIMIT 1;
    
    WHEN 'Rescheduled' THEN
      SELECT name INTO target_status
      FROM public.pipeline_columns 
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
    UPDATE public.leads 
    SET status = target_status, updated_at = now()
    WHERE id = NEW.lead_id;
  END IF;

  RETURN NEW;
END;
$function$;