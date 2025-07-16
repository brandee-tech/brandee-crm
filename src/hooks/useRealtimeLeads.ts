
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  company_id: string;
  created_at: string;
  created_by: string | null;
}

export const useRealtimeLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeads = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        setLeads([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Realtime leads before filtering:', (data || []).length);
      
      // Aplicar filtro baseado no role do usuário (buscar role corretamente)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select(`
          id,
          roles!profiles_role_id_fkey(name)
        `)
        .eq('id', user.id)
        .single();

      const userRole = userProfile?.roles?.name;
      console.log('Realtime user role for filtering:', userRole);

      let filteredLeads = data || [];
      if (userRole === 'Closer') {
        // Closers veem leads atribuídos a eles OU leads não-atribuídos (para poderem assumir)
        filteredLeads = (data || []).filter(lead => 
          lead.assigned_to === user.id || lead.assigned_to === null
        );
        console.log('Realtime filtering for Closer - showing assigned + unassigned leads:', filteredLeads.length);
      } else {
        // Admins, SDRs e outros roles veem todos os leads da empresa
        console.log('Realtime user is Admin/SDR - showing all company leads:', filteredLeads.length);
      }
      
      setLeads(filteredLeads);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive"
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();

      // Setup realtime subscription
      const channel = supabase
        .channel('leads-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads'
          },
          (payload) => {
            console.log('Lead change detected:', payload);
            setIsUpdating(true);
            
            setTimeout(() => {
              fetchLeads();
              setIsUpdating(false);
            }, 500);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    leads,
    loading,
    isUpdating,
    refetch: fetchLeads
  };
};
