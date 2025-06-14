
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FollowUp } from '@/types/appointmentRecord';

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFollowUps = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      
      setFollowUps((data || []) as FollowUp[]);
    } catch (error) {
      console.error('Erro ao buscar follow-ups:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os follow-ups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFollowUp = async (followUpData: Omit<FollowUp, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'company_id'>) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('follow_ups')
        .insert([{
          ...followUpData,
          created_by: user?.id || '',
          company_id: profileData.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Follow-up criado com sucesso"
      });

      fetchFollowUps();
      return data;
    } catch (error) {
      console.error('Erro ao criar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o follow-up",
        variant: "destructive"
      });
      throw error;
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

      fetchFollowUps();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o follow-up",
        variant: "destructive"
      });
      throw error;
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

      fetchFollowUps();
    } catch (error) {
      console.error('Erro ao deletar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o follow-up",
        variant: "destructive"
      });
    }
  };

  const getFollowUpsByAppointment = (appointmentId: string) => {
    return followUps.filter(followUp => followUp.appointment_id === appointmentId);
  };

  const getPendingFollowUps = () => {
    return followUps.filter(followUp => !followUp.completed);
  };

  const getNextSequenceNumber = (appointmentId: string) => {
    const appointmentFollowUps = getFollowUpsByAppointment(appointmentId);
    return appointmentFollowUps.length > 0 
      ? Math.max(...appointmentFollowUps.map(f => f.sequence_number)) + 1 
      : 1;
  };

  useEffect(() => {
    if (user) {
      fetchFollowUps();

      // Create unique channel name using user ID and timestamp
      const channelName = `follow-ups-changes-${user.id}-${Date.now()}`;

      // Setup realtime subscription
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follow_ups'
          },
          (payload) => {
            console.log('Follow-up change detected:', payload);
            setIsUpdating(true);
            
            setTimeout(() => {
              fetchFollowUps();
              setIsUpdating(false);
            }, 500);
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up follow-ups channel:', channelName);
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    followUps,
    loading,
    isUpdating,
    createFollowUp: async (followUpData: Omit<FollowUp, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'company_id'>) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;

        const { data, error } = await supabase
          .from('follow_ups')
          .insert([{
            ...followUpData,
            created_by: user?.id || '',
            company_id: profileData.company_id
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Follow-up criado com sucesso"
        });

        fetchFollowUps();
        return data;
      } catch (error) {
        console.error('Erro ao criar follow-up:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o follow-up",
          variant: "destructive"
        });
        throw error;
      }
    },
    updateFollowUp: async (id: string, updates: Partial<FollowUp>) => {
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

        fetchFollowUps();
        return data;
      } catch (error) {
        console.error('Erro ao atualizar follow-up:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o follow-up",
          variant: "destructive"
        });
        throw error;
      }
    },
    deleteFollowUp: async (id: string) => {
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

        fetchFollowUps();
      } catch (error) {
        console.error('Erro ao deletar follow-up:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o follow-up",
          variant: "destructive"
        });
      }
    },
    getFollowUpsByAppointment,
    getPendingFollowUps,
    getNextSequenceNumber,
    refetch: fetchFollowUps
  };
};
