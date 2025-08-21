import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  description: string | null;
  status: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchPartners = async () => {
    if (!user || !userInfo?.company_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }
      
      setPartners(data || []);
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async (partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !userInfo?.company_id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou sem empresa",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .insert([{ ...partnerData, company_id: userInfo.company_id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating partner:', error);
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o parceiro",
        variant: "destructive"
      });
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating partner:', error);
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parceiro",
        variant: "destructive"
      });
    }
  };

  const deletePartner = async (id: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting partner:', error);
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o parceiro",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!user?.id || !userInfo?.company_id) return;
    
    fetchPartners();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime partners channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name
    const channelName = `realtime-partners-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partners'
        },
        (payload) => {
          console.log('Realtime partner change detected:', payload);
          setIsUpdating(true);
          
          fetchPartners().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime partners subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user?.id, userInfo?.company_id]);

  return {
    partners,
    loading,
    isUpdating,
    createPartner,
    updatePartner,
    deletePartner,
    refetch: fetchPartners
  };
};