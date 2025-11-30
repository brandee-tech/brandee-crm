import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConversationTagAssignment {
  id: string;
  conversation_id: string;
  tag_id: string;
  created_at: string;
}

export const useWhatsAppConversationTags = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const { data: assignedTags, isLoading } = useQuery({
    queryKey: ['whatsapp-conversation-tags', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('whatsapp_conversation_tag_assignments')
        .select(`
          id,
          tag_id,
          tag:lead_tags(id, name, color)
        `)
        .eq('conversation_id', conversationId);

      if (error) throw error;
      return data.map(item => item.tag).filter(Boolean);
    },
    enabled: !!conversationId,
  });

  const assignTag = useMutation({
    mutationFn: async ({ conversationId, tagId }: { conversationId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('whatsapp_conversation_tag_assignments')
        .insert({ conversation_id: conversationId, tag_id: tagId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversation-tags'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Tag adicionada à conversa');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Esta tag já está vinculada a esta conversa');
      } else {
        toast.error(`Erro ao adicionar tag: ${error.message}`);
      }
    },
  });

  const removeTag = useMutation({
    mutationFn: async ({ conversationId, tagId }: { conversationId: string; tagId: string }) => {
      const { error } = await supabase
        .from('whatsapp_conversation_tag_assignments')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversation-tags'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Tag removida da conversa');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover tag: ${error.message}`);
    },
  });

  return {
    assignedTags,
    isLoading,
    assignTag,
    removeTag,
  };
};
