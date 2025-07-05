import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Script {
  id: string;
  title: string;
  content: string;
  description: string | null;
  category: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useRealtimeScripts = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchScripts = async () => {
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
        setScripts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setScripts(data || []);
    } catch (error) {
      console.error('Erro ao buscar scripts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os scripts",
        variant: "destructive"
      });
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetchScripts();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime scripts channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name using user ID and timestamp
    const channelName = `realtime-scripts-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scripts'
        },
        (payload) => {
          console.log('Realtime script change detected:', payload);
          setIsUpdating(true);
          
          fetchScripts().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime scripts subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user]);

  return {
    scripts,
    loading,
    isUpdating,
    refetch: fetchScripts
  };
};