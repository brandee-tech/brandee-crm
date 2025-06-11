
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaasMetrics {
  total_companies: number;
  total_users: number;
  active_companies: number;
  new_users_this_month: number;
  companies_by_plan: Record<string, number>;
}

export const useSaasMetrics = () => {
  const [metrics, setMetrics] = useState<SaasMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_saas_metrics');
      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao buscar métricas SaaS:', error);
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
