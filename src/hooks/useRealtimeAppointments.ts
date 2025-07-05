
import { useState, useEffect, useRef, useCallback } from 'react';
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

  const fetchAppointments = useCallback(async () => {
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
  }, [user, toast]);

  useEffect(() => {
    if (!user?.id) return;
    
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

    // Guard: Only create subscription if user is still available
    if (!user?.id) return cleanup;

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
          
          setTimeout(() => {
            fetchAppointments().finally(() => {
              setIsUpdating(false);
            });
          }, 100);
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
          
          setTimeout(() => {
            fetchAppointments().finally(() => {
              setIsUpdating(false);
            });
          }, 100);
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
          
          setTimeout(() => {
            fetchAppointments().finally(() => {
              setIsUpdating(false);
            });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Realtime appointments subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Realtime appointments subscription failed:', status);
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user?.id, fetchAppointments]);

  return {
    appointments,
    loading,
    isUpdating,
    refetch: fetchAppointments
  };
};
