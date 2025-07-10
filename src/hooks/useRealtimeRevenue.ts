import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';

interface RevenueMetrics {
  totalRevenue: number;
  totalLost: number;
  averageTicket: number;
  totalLeads: number;
  conversionRate: number;
  soldLeads: number;
  lostLeads: number;
}

export const useRealtimeRevenue = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    totalLost: 0,
    averageTicket: 0,
    totalLeads: 0,
    conversionRate: 0,
    soldLeads: 0,
    lostLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { company: currentCompany } = useCurrentCompany();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchRevenueMetrics = async () => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      
      // Buscar todas as métricas de receita
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, revenue_generated, revenue_lost, product_value')
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.revenue_generated || 0), 0) || 0;
      const totalLost = leads?.reduce((sum, lead) => sum + (lead.revenue_lost || 0), 0) || 0;
      const soldLeads = leads?.filter(lead => lead.status === 'Vendido').length || 0;
      const lostLeads = leads?.filter(lead => lead.status === 'Perdido').length || 0;
      const totalLeads = leads?.length || 0;
      const averageTicket = soldLeads > 0 ? totalRevenue / soldLeads : 0;
      const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0;

      setMetrics({
        totalRevenue,
        totalLost,
        averageTicket,
        totalLeads,
        conversionRate,
        soldLeads,
        lostLeads,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas de receita:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentCompany?.id) return;
    
    fetchRevenueMetrics();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime revenue channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name
    const channelName = `realtime-revenue-${currentCompany.id}-${Date.now()}`;
    
    // Setup realtime subscription to leads table
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `company_id=eq.${currentCompany.id}`
        },
        (payload) => {
          console.log('Realtime lead change detected - updating revenue:', payload);
          setIsUpdating(true);
          
          // Small delay to ensure database trigger has processed
          setTimeout(() => {
            fetchRevenueMetrics().finally(() => {
              setIsUpdating(false);
            });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Realtime revenue subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [currentCompany?.id]);

  return {
    metrics,
    loading,
    isUpdating,
    refetch: fetchRevenueMetrics,
  };
};