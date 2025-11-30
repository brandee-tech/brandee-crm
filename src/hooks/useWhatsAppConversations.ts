import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppConversation } from '@/types/whatsapp';
import { toast } from 'sonner';

export const useWhatsAppConversations = (companyId?: string, instanceId?: string) => {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['whatsapp-conversations', companyId, instanceId],
    queryFn: async () => {
      if (!companyId) return [];

      let query = supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          contact:whatsapp_contacts(*),
          assigned_user:profiles(id, full_name)
        `)
        .eq('company_id', companyId);

      // Se tiver instanceId, filtrar por instância (visão do closer)
      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      }

      const { data, error } = await query.order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as WhatsAppConversation[];
    },
    enabled: !!companyId,
  });

  const updateConversation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      updates 
    }: { 
      conversationId: string; 
      updates: Partial<WhatsAppConversation> 
    }) => {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .update(updates)
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar conversa: ${error.message}`);
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('whatsapp_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });

  const assignAgent = useMutation({
    mutationFn: async ({ 
      conversationId, 
      agentId 
    }: { 
      conversationId: string; 
      agentId: string | null 
    }) => {
      const { error } = await supabase
        .from('whatsapp_conversations')
        .update({ assigned_to: agentId })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Atendente atribuído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atribuir atendente: ${error.message}`);
    },
  });

  return {
    conversations,
    isLoading,
    updateConversation,
    markAsRead,
    assignAgent,
  };
};
