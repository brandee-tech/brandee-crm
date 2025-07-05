
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AssigneeUser {
  id: string;
  full_name: string | null;
  email: string | null;
  roles?: {
    name: string;
  };
}

export const useClosers = () => {
  const [closers, setClosers] = useState<AssigneeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClosers = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      // Primeiro obter o company_id do usuário atual
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !currentUserProfile?.company_id) {
        console.error('Erro ao buscar company_id do usuário:', profileError);
        setClosers([]);
        setLoading(false);
        return;
      }

      // Buscar todos os usuários da empresa que podem ser assignees
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          roles (
            name
          )
        `)
        .eq('company_id', currentUserProfile.company_id)
        .not('roles', 'is', null)
        .order('full_name', { ascending: true });

      if (error) throw error;
      
      // Filtrar apenas roles que podem gerenciar agendamentos
      const validRoles = ['Admin', 'Gerente', 'Closer', 'Vendedor', 'Coordenador'];
      const filteredUsers = (data || []).filter(user => 
        user.roles && validRoles.includes(user.roles.name)
      );
      
      setClosers(filteredUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários para assignar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchClosers();
  }, [fetchClosers]);

  return {
    closers,
    loading,
    refetch: fetchClosers
  };
};
