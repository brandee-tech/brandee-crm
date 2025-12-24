
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaasMetrics {
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
    growth: Array<{ date: string; count: number }>;
  };
  users: {
    by_role: Record<string, number>;
    growth: Array<{ date: string; count: number }>;
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
  top_companies: Array<{
    id: string;
    name: string;
    users_count: number;
    leads_count: number;
    appointments_count: number;
    activity_score: number;
  }>;
}

export const useSaasMetrics = () => {
  const [metrics, setMetrics] = useState<SaasMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_advanced_saas_analytics', {
        period_days: 30,
        company_filter: null
      });
      if (error) throw error;

      console.log('Raw data from get_advanced_saas_analytics:', data);

      // A função retorna diretamente o objeto JSON com as métricas
      setMetrics(data as unknown as SaasMetrics);
    } catch (error) {
      console.error('Erro ao buscar métricas SaaS:', error);
      console.error('Error details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, refetch: fetchMetrics };
};
