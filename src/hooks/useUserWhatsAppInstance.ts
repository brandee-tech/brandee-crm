import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppInstance } from '@/types/whatsapp';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';

export const useUserWhatsAppInstance = () => {
  const queryClient = useQueryClient();
  const { userInfo } = useCurrentUser();
  const userId = userInfo?.user_id;
  const companyId = userInfo?.company_id;

  const { data: instance, isLoading } = useQuery({
    queryKey: ['user-whatsapp-instance', userId],
    queryFn: async () => {
      if (!userId || !companyId) return null;

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppInstance | null;
    },
    enabled: !!userId && !!companyId,
  });

  const createInstance = useMutation({
    mutationFn: async (instanceName: string) => {
      if (!userId || !companyId) {
        throw new Error('Usuário ou empresa não identificados');
      }

      const { data, error } = await supabase.functions.invoke('evolution-api-proxy', {
        body: {
          action: 'createInstance',
          data: { instanceName, userId },
        },
      });

      if (error) throw error;

      // Criar registro no banco de dados vinculado ao usuário
      const { data: newInstance, error: dbError } = await supabase
        .from('whatsapp_instances')
        .insert({
          company_id: companyId,
          user_id: userId,
          instance_name: instanceName,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return newInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-whatsapp-instance'] });
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
        .eq('instance_name', instanceName)
        .eq('user_id', userId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-whatsapp-instance'] });
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
