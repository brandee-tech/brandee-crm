import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeWhatsApp = (companyId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    console.log('[Realtime] Subscribing to WhatsApp updates for company:', companyId);

    // Canal único para todas as mudanças do WhatsApp
    const channel = supabase
      .channel(`whatsapp-realtime-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_instances',
        },
        (payload) => {
          if ((payload.new as any)?.company_id === companyId || (payload.old as any)?.company_id === companyId) {
            console.log('[Realtime] Instance change detected');
            queryClient.invalidateQueries({ queryKey: ['whatsapp-instance'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_conversations',
        },
        (payload) => {
          const record = payload.new || payload.old;
          if ((record as any)?.company_id === companyId) {
            console.log('[Realtime] Conversation change detected');
            queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        (payload) => {
          const record = payload.new || payload.old;
          if ((record as any)?.company_id === companyId) {
            console.log('[Realtime] Message change detected:', payload.eventType);
            queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
            queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
};
