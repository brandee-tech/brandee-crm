-- Migration to fix get_advanced_saas_analytics and recreate admin_companies_view

-- 1. DROP OBSOLETE FUNCTION
-- Drop the obsolete 0-argument version if it exists
DROP FUNCTION IF EXISTS public.get_advanced_saas_analytics();

-- 2. FIX FUNCTION SIGNATURE
-- Replace the 2-argument version ensuring defaults are set correctly
CREATE OR REPLACE FUNCTION public.get_advanced_saas_analytics(
  period_days integer DEFAULT 30, 
  company_filter uuid DEFAULT NULL::uuid
)
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

-- 3. RECREATE VIEW
-- Create admin_companies_view if it doesn't exist (using OR REPLACE just in case)
CREATE OR REPLACE VIEW public.admin_companies_view 
WITH (security_invoker = true)
AS
SELECT 
  c.*,
  COALESCE(user_counts.user_count, 0) as user_count,
  COALESCE(lead_counts.leads_count, 0) as leads_count,
  COALESCE(appointment_counts.appointments_count, 0) as appointments_count
FROM public.companies c
LEFT JOIN (
  SELECT company_id, COUNT(*) as user_count
  FROM public.profiles
  GROUP BY company_id
) user_counts ON c.id = user_counts.company_id
LEFT JOIN (
  SELECT company_id, COUNT(*) as leads_count
  FROM public.leads
  GROUP BY company_id
) lead_counts ON c.id = lead_counts.company_id
LEFT JOIN (
  SELECT company_id, COUNT(*) as appointments_count
  FROM public.appointments
  GROUP BY company_id
) appointment_counts ON c.id = appointment_counts.company_id;

-- Grant permissions
GRANT SELECT ON public.admin_companies_view TO authenticated;
