import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Meeting } from '@/types/meeting';

export const useRealtimeMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchMeetings = async () => {
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
        setMeetings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      
      setMeetings((data || []) as Meeting[]);
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reuniões",
        variant: "destructive"
      });
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetchMeetings();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime meetings channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name using user ID and timestamp
    const channelName = `realtime-meetings-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        (payload) => {
          console.log('Realtime meeting change detected:', payload);
          setIsUpdating(true);
          
          fetchMeetings().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime meetings subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user]);

  return {
    meetings,
    loading,
    isUpdating,
    refetch: fetchMeetings
  };
};