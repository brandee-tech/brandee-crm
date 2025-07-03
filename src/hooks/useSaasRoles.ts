import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean | null;
  company_id: string | null;
}

export const useSaasRoles = (companyId?: string) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    if (!companyId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar roles do sistema (is_system_role = true) + roles da empresa específica
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description, is_system_role, company_id')
        .or(`is_system_role.eq.true,company_id.eq.${companyId}`)
        .order('is_system_role', { ascending: false })
        .order('name');

      if (error) throw error;
      
      console.log('Roles carregados para empresa:', companyId, data);
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [companyId]);

  return {
    roles,
    loading,
    refetch: fetchRoles
  };
};