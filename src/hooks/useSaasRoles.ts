import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: any;
  is_system_role: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSaasRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_system_role', true)
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao buscar cargos do sistema:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: { name: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          permissions: {},
          is_system_role: true,
          company_id: null
        })
        .select()
        .single();

      if (error) throw error;
      
      setRoles(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Cargo do sistema criado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar cargo do sistema:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome no sistema",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o cargo do sistema",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const updateRole = async (id: string, updates: { name?: string; description?: string; permissions?: any }) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRoles(prev => prev.map(role => role.id === id ? data : role));
      toast({
        title: "Sucesso",
        description: "Cargo do sistema atualizado com sucesso"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar cargo do sistema:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome no sistema",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cargo do sistema",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRoles(prev => prev.filter(role => role.id !== id));
      toast({
        title: "Sucesso",
        description: "Cargo do sistema removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover cargo do sistema:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cargo do sistema",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const updateRolePermissions = async (id: string, permissions: any) => {
    await updateRole(id, { permissions });
  };

  return {
    roles,
    loading,
    createRole,
    updateRole,
    updateRolePermissions,
    deleteRole,
    refetch: fetchRoles
  };
};