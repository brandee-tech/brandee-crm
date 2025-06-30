
import { useState, useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

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
    if (!user) return;
    
    fetchAppointments();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime appointments channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name using user ID and timestamp
    const channelName = `realtime-appointments-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Realtime appointment change detected:', payload);
          setIsUpdating(true);
          
          // Remove artificial delay - fetch immediately
          fetchAppointments().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Realtime lead change detected:', payload);
          setIsUpdating(true);
          
          fetchAppointments().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Realtime profile change detected:', payload);
          setIsUpdating(true);
          
          fetchAppointments().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime appointments subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user]);

  return {
    appointments,
    loading,
    isUpdating,
    refetch: fetchAppointments
  };
};
