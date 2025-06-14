
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AppointmentRecord } from '@/types/appointmentRecord';

export const useAppointmentRecords = () => {
  const [records, setRecords] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchRecords = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointment_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords((data || []) as AppointmentRecord[]);
    } catch (error) {
      console.error('Erro ao buscar registros de atendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros de atendimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (recordData: Omit<AppointmentRecord, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'company_id'>) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('appointment_records')
        .insert([{
          ...recordData,
          created_by: user?.id || '',
          company_id: profileData.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Registro de atendimento criado com sucesso"
      });

      fetchRecords();
      return data;
    } catch (error) {
      console.error('Erro ao criar registro de atendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o registro de atendimento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: Partial<AppointmentRecord>) => {
    try {
      const { data, error } = await supabase
        .from('appointment_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Registro de atendimento atualizado com sucesso"
      });

      fetchRecords();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar registro de atendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o registro de atendimento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointment_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Registro de atendimento removido com sucesso"
      });

      fetchRecords();
    } catch (error) {
      console.error('Erro ao deletar registro de atendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o registro de atendimento",
        variant: "destructive"
      });
    }
  };

  const getRecordsByAppointment = (appointmentId: string) => {
    return records.filter(record => record.appointment_id === appointmentId);
  };

  useEffect(() => {
    if (!user) return;

    fetchRecords();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up appointment records channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name using user ID and timestamp
    const channelName = `appointment-records-changes-${user.id}-${Date.now()}`;

    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_records'
        },
        (payload) => {
          console.log('Appointment record change detected:', payload);
          setIsUpdating(true);
          
          setTimeout(() => {
            fetchRecords();
            setIsUpdating(false);
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('Appointment records subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user]);

  return {
    records,
    loading,
    isUpdating,
    createRecord: async (recordData: Omit<AppointmentRecord, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'company_id'>) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;

        const { data, error } = await supabase
          .from('appointment_records')
          .insert([{
            ...recordData,
            created_by: user?.id || '',
            company_id: profileData.company_id
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Registro de atendimento criado com sucesso"
        });

        fetchRecords();
        return data;
      } catch (error) {
        console.error('Erro ao criar registro de atendimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o registro de atendimento",
          variant: "destructive"
        });
        throw error;
      }
    },
    updateRecord: async (id: string, updates: Partial<AppointmentRecord>) => {
      try {
        const { data, error } = await supabase
          .from('appointment_records')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Registro de atendimento atualizado com sucesso"
        });

        fetchRecords();
        return data;
      } catch (error) {
        console.error('Erro ao atualizar registro de atendimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o registro de atendimento",
          variant: "destructive"
        });
        throw error;
      }
    },
    deleteRecord: async (id: string) => {
      try {
        const { error } = await supabase
          .from('appointment_records')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Registro de atendimento removido com sucesso"
        });

        fetchRecords();
      } catch (error) {
        console.error('Erro ao deletar registro de atendimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o registro de atendimento",
          variant: "destructive"
        });
      }
    },
    getRecordsByAppointment: (appointmentId: string) => {
      return records.filter(record => record.appointment_id === appointmentId);
    },
    refetch: fetchRecords
  };
};
