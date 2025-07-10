import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FollowUp {
  id: string;
  appointment_id: string;
  appointment_record_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  channel: "Telefone" | "WhatsApp" | "Email" | "Presencial" | "VideoCall";
  message_sent: string | null;
  response_received: string | null;
  response_date: string | null;
  result: "Fechou" | "Não Fechou" | "Aguardando" | "Sem Resposta" | "Reagendar" | "No Show" | null;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
  sequence_number: number;
  meeting_url: string | null;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchFollowUps = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        setFollowUps([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setFollowUps((data as FollowUp[]) || []);
    } catch (error) {
      console.error('Erro ao buscar follow-ups:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os follow-ups",
        variant: "destructive"
      });
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  };

  const createFollowUp = async (followUpData: {
    appointment_id: string;
    appointment_record_id?: string;
    scheduled_date: string;
    scheduled_time: string;
    channel: string;
    message_sent?: string;
    notes?: string;
    meeting_url?: string;
    sequence_number?: number;
    response_received?: string;
    response_date?: string;
    result?: string;
    completed?: boolean;
    completed_at?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Company ID não encontrado');
      }

      // Buscar próximo sequence_number
      const { data: existingFollowUps } = await supabase
        .from('follow_ups')
        .select('sequence_number')
        .eq('appointment_id', followUpData.appointment_id)
        .order('sequence_number', { ascending: false })
        .limit(1);

      const nextSequenceNumber = existingFollowUps && existingFollowUps.length > 0 
        ? existingFollowUps[0].sequence_number + 1 
        : 1;

      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          ...followUpData,
          sequence_number: nextSequenceNumber,
          created_by: user.id,
          company_id: profileData.company_id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Follow-up criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o follow-up",
        variant: "destructive"
      });
    }
  };

  const updateFollowUp = async (id: string, updates: Partial<FollowUp>) => {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Follow-up atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o follow-up",
        variant: "destructive"
      });
    }
  };

  const completeFollowUp = async (id: string, result: string, responseReceived?: string) => {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          result,
          response_received: responseReceived,
          response_date: responseReceived ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Follow-up concluído com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao concluir follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir o follow-up",
        variant: "destructive"
      });
    }
  };

  const deleteFollowUp = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Follow-up removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o follow-up",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    fetchFollowUps();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime follow-ups channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name
    const channelName = `realtime-followups-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_ups'
        },
        (payload) => {
          console.log('Realtime follow-up change detected:', payload);
          setIsUpdating(true);
          
          fetchFollowUps().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime follow-ups subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user?.id]);

  const getFollowUpsByAppointment = (appointmentId: string) => {
    return followUps.filter(followUp => followUp.appointment_id === appointmentId);
  };

  const getNextSequenceNumber = (appointmentId: string) => {
    const appointmentFollowUps = followUps.filter(fu => fu.appointment_id === appointmentId);
    return appointmentFollowUps.length > 0 
      ? Math.max(...appointmentFollowUps.map(fu => fu.sequence_number)) + 1 
      : 1;
  };

  return {
    followUps,
    loading,
    isUpdating,
    createFollowUp,
    updateFollowUp,
    completeFollowUp,
    deleteFollowUp,
    getFollowUpsByAppointment,
    getNextSequenceNumber,
    refetch: fetchFollowUps
  };
};