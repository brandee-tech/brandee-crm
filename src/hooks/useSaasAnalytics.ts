import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SaasAnalyticsData {
  overview: {
    total_companies: number;
    total_users: number;
    active_companies: number;
    new_users_this_period: number;
  };
  companies: {
    by_plan: Record<string, number>;
    by_industry: Record<string, number>;
    by_size: Record<string, number>;
    growth: { date: string; count: number }[];
  };
  users: {
    by_role: Record<string, number>;
    growth: { date: string; count: number }[];
  };
  activities: {
    leads: {
      total: number;
      by_status: Record<string, number>;
    };
    appointments: {
      total: number;
      by_status: Record<string, number>;
    };
    meetings: {
      total: number;
      by_status: Record<string, number>;
    };
    tasks: {
      total: number;
      by_status: Record<string, number>;
    };
  };
  top_companies: {
    id: string;
    name: string;
    users_count: number;
    leads_count: number;
    appointments_count: number;
    activity_score: number;
  }[];
}

export interface AnalyticsFilters {
  period_days: number;
  company_filter?: string;
}

export const useSaasAnalytics = (filters: AnalyticsFilters = { period_days: 30 }) => {
  const [analytics, setAnalytics] = useState<SaasAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_advanced_saas_analytics', {
        period_days: filters.period_days,
        company_filter: filters.company_filter || null
      });

      if (error) throw error;
      
      // A função retorna um JSON, então fazemos parse
      const analyticsData = typeof data === 'string' ? JSON.parse(data) : data;
      setAnalytics(analyticsData as SaasAnalyticsData);
    } catch (error) {
      console.error('Erro ao buscar analytics SaaS:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.period_days, filters.company_filter]);

  return { 
    analytics, 
    loading, 
    refetch: fetchAnalytics 
  };
};