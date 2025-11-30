import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWhatsAppLeadLink = () => {
  const queryClient = useQueryClient();

  const linkContactToLead = useMutation({
    mutationFn: async ({ contactId, leadId }: { contactId: string; leadId: string }) => {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .update({ lead_id: leadId })
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Contato vinculado ao lead com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao vincular contato: ${error.message}`);
    },
  });

  const unlinkContactFromLead = useMutation({
    mutationFn: async (contactId: string) => {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .update({ lead_id: null })
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Vínculo removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover vínculo: ${error.message}`);
    },
  });

  return {
    linkContactToLead,
    unlinkContactFromLead,
  };
};
