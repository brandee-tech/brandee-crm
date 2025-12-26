import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
    description: string | null;
    is_system_role: boolean;
    permissions: any;
  };
  companies?: {
    name: string;
    domain: string | null;
    plan: string | null;
  };
}

export const useRealtimeProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchProfiles = async () => {
    try {
      if (!userInfo?.company_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .eq('company_id', userInfo.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os perfis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .single();

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      if (id === userInfo?.user_id) {
        toast({
          title: "Erro",
          description: "Você não pode deletar seu próprio perfil",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!userInfo?.company_id) return;

    fetchProfiles();

    const channelName = `realtime-profiles-${userInfo.company_id}`;

    // Clean up any existing channel before subscribing to a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `company_id=eq.${userInfo.company_id}`
        },
        (payload) => {
          console.log('🔄 Alteração detectada em profiles (Company), recarregando...', payload);
          setIsUpdating(true);
          fetchProfiles().finally(() => setIsUpdating(false));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userInfo?.company_id]);

  return {
    profiles,
    loading,
    isUpdating,
    updateProfile,
    deleteProfile,
    refetch: fetchProfiles
  };
};