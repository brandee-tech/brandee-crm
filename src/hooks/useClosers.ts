
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';

interface AssigneeUser {
  id: string;
  full_name: string | null;
  email: string | null;
  roles?: {
    name: string;
  };
}

export const useClosers = (enabled: boolean = true) => {
  const [closers, setClosers] = useState<AssigneeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();

  const fetchClosers = useCallback(async () => {
    if (!enabled || !user || !userInfo?.company_id || !userInfo?.role_name) {
      setLoading(false);
      return;
    }

    try {
      const currentUserRole = userInfo.role_name;

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
        .eq('company_id', userInfo.company_id)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar closers:', error);
        // Se há erro na query com roles, buscar sem roles como fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('company_id', userInfo.company_id)
          .order('full_name', { ascending: true });
          
        if (fallbackError) throw fallbackError;
        setClosers(fallbackData || []);
        return;
      }
      
      console.log('🔍 [DEBUG] useClosers - Dados retornados:', data);
      
      // Definir roles válidos baseado no role do usuário atual
      let validRoles: string[];
      if (currentUserRole === 'SDR') {
        validRoles = ['Administrador', 'Admin', 'Gerente', 'Closer', 'SDR'];
      } else if (currentUserRole === 'Closer') {
        validRoles = ['Administrador', 'Admin', 'Gerente', 'Closer'];
      } else {
        validRoles = ['Administrador', 'Admin', 'Gerente', 'Closer', 'SDR', 'Vendedor', 'Coordenador'];
      }

      const filteredUsers = (data || []).filter(user => {
        if (!user.roles) {
          return currentUserRole !== 'SDR';
        }
        return validRoles.includes(user.roles.name);
      });
      
      setClosers(filteredUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários para assignar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
      setClosers([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, user, userInfo?.company_id, userInfo?.role_name, toast]);

  useEffect(() => {
    if (enabled) {
      fetchClosers();
    }
  }, [fetchClosers]);

  return {
    closers,
    loading,
    refetch: fetchClosers
  };
};
