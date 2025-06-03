
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  };
  companies?: {
    name: string;
    domain: string | null;
    plan: string | null;
  };
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
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
            is_system_role
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .single();

      if (error) throw error;
      setProfiles(prev => prev.map(profile => profile.id === id ? data : profile));
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

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  return {
    profiles,
    loading,
    updateProfile,
    refetch: fetchProfiles
  };
};
