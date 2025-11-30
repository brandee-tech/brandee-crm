import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppMessage } from '@/types/whatsapp';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';

export const useWhatsAppMessages = (conversationId?: string, instanceName?: string) => {
  const queryClient = useQueryClient();
  const { userInfo } = useCurrentUser();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as WhatsAppMessage[];
    },
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ 
      number, 
      text, 
      companyId 
    }: { 
      number: string; 
      text: string;
      companyId: string;
    }) => {
      if (!instanceName) throw new Error('Instância não configurada');

      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'sendText',
          data: { instanceName, number, text },
        },
      });

      if (error) throw error;

      // Inserir mensagem no banco de dados
      const { data: newMessage, error: dbError } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId!,
          company_id: companyId,
          whatsapp_message_id: data.key?.id,
          direction: 'outgoing',
          content: text,
          message_type: 'text',
          status: 'sent',
          sent_by: userInfo?.user_id,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const sendMedia = useMutation({
    mutationFn: async ({ 
      number, 
      mediaUrl, 
      caption, 
      mediaType,
      companyId 
    }: { 
      number: string; 
      mediaUrl: string;
      caption?: string;
      mediaType: 'image' | 'audio' | 'video' | 'document';
      companyId: string;
    }) => {
      if (!instanceName) throw new Error('Instância não configurada');

      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'sendMedia',
          data: { instanceName, number, mediaUrl, caption, mediaType },
        },
      });

      if (error) throw error;

      // Inserir mensagem no banco de dados
      const { data: newMessage, error: dbError } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId!,
          company_id: companyId,
          whatsapp_message_id: data.key?.id,
          direction: 'outgoing',
          content: caption,
          message_type: mediaType,
          media_url: mediaUrl,
          status: 'sent',
          sent_by: userInfo?.user_id,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Mídia enviada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar mídia: ${error.message}`);
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
    sendMedia,
  };
};
