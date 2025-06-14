
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointment';

export const useRealtimeAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
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
        setAppointments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (
            id,
            name,
            email,
            phone
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('company_id', profileData.company_id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      
      setAppointments(data as Appointment[] || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();

      // Create unique channel name using user ID and timestamp
      const channelName = `appointments-changes-${user.id}-${Date.now()}`;
      
      // Setup realtime subscription
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            console.log('Appointment change detected:', payload);
            setIsUpdating(true);
            
            setTimeout(() => {
              fetchAppointments();
              setIsUpdating(false);
            }, 500);
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up appointments channel:', channelName);
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    appointments,
    loading,
    isUpdating,
    refetch: fetchAppointments
  };
};
