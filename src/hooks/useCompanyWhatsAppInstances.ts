import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppInstance } from '@/types/whatsapp';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';

export const useCompanyWhatsAppInstances = () => {
  const queryClient = useQueryClient();
  const { userInfo } = useCurrentUser();
  const companyId = userInfo?.company_id;

  const { data: instances, isLoading } = useQuery({
    queryKey: ['company-whatsapp-instances', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select(`
          *,
          user:profiles(id, full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhatsAppInstance[];
    },
    enabled: !!companyId,
  });

  const disconnectInstance = useMutation({
    mutationFn: async (instanceName: string) => {
      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'logout',
          data: { instanceName },
        },
      });

      if (error) throw error;

      // Atualizar status no banco
      await supabase
        .from('whatsapp_instances')
        .update({ status: 'disconnected', qr_code: null })
        .eq('instance_name', instanceName);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-whatsapp-instances'] });
      toast.success('Instância desconectada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao desconectar instância: ${error.message}`);
    },
  });

  return {
    instances,
    isLoading,
    disconnectInstance,
  };
};
