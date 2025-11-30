import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppInstance } from '@/types/whatsapp';
import { toast } from 'sonner';

export const useWhatsAppInstance = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: instance, isLoading } = useQuery({
    queryKey: ['whatsapp-instance', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppInstance | null;
    },
    enabled: !!companyId,
  });

  const createInstance = useMutation({
    mutationFn: async (instanceName: string) => {
      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'createInstance',
          data: { instanceName },
        },
      });

      if (error) throw error;

      // Criar registro no banco de dados
      const { data: newInstance, error: dbError } = await supabase
        .from('whatsapp_instances')
        .insert({
          company_id: companyId!,
          instance_name: instanceName,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return newInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instance'] });
      toast.success('Instância criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar instância: ${error.message}`);
    },
  });

  const getQRCode = useMutation({
    mutationFn: async (instanceName: string) => {
      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'getQRCode',
          data: { instanceName },
        },
      });

      if (error) throw error;
      
      // A Evolution API retorna o código do QR no campo "code"
      // Esse código precisa ser convertido em imagem no frontend
      return {
        code: data.code,
        pairingCode: data.pairingCode
      };
    },
  });

  const logout = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instance'] });
      toast.success('Desconectado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao desconectar: ${error.message}`);
    },
  });

  return {
    instance,
    isLoading,
    createInstance,
    getQRCode,
    logout,
  };
};
