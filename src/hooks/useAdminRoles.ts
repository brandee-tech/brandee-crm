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

export const useAdminRoles = (companyId: string) => {
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
      // Buscar roles da empresa E roles do sistema
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .or(`company_id.eq.${companyId},is_system_role.eq.true`)
        .order('name');

      if (error) throw error;

      // Se tivermos roles, vamos verificar se existem overrides de permissão para os roles de sistema
      if (data && data.length > 0) {
        const systemRoleIds = data.filter(r => r.is_system_role).map(r => r.id);

        if (systemRoleIds.length > 0) {
          const { data: overrides, error: overridesError } = await supabase
            .from('company_role_permissions')
            .select('*')
            .eq('company_id', companyId)
            .in('role_id', systemRoleIds);

          if (!overridesError && overrides) {
            // Aplicar overrides aos roles de sistema na lista
            const rolesWithOverrides = data.map(role => {
              if (role.is_system_role) {
                const override = overrides.find(o => o.role_id === role.id);
                if (override && override.permissions) {
                  return { ...role, permissions: override.permissions };
                }
              }
              return role;
            });
            setRoles(rolesWithOverrides);
            return;
          }
        }
      }

      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cargos",
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
          is_system_role: false,
          company_id: companyId
        })
        .select()
        .single();

      if (error) throw error;

      setRoles(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Cargo criado com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar cargo:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome na empresa",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o cargo",
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
        description: "Cargo atualizado com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Erro",
          description: "Já existe um cargo com este nome na empresa",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cargo",
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
        description: "Cargo removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover cargo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cargo",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [companyId]);

  const updateRolePermissions = async (roleId: string, permissions: any) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      if (role.is_system_role) {
        // Para roles do sistema, atualizamos a tabela de permissões da empresa (Override)
        console.log('Atualizando permissões de System Role via override:', role.name);

        // Verificar se já existe override
        const { data: existingOverride } = await supabase
          .from('company_role_permissions')
          .select('id')
          .eq('company_id', companyId)
          .eq('role_id', roleId)
          .maybeSingle();

        let error;

        if (existingOverride) {
          const { error: updateError } = await supabase
            .from('company_role_permissions')
            .update({ permissions })
            .eq('id', existingOverride.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('company_role_permissions')
            .insert({
              company_id: companyId,
              role_id: roleId,
              permissions
            });
          error = insertError;
        }

        if (error) throw error;
      } else {
        // Para roles customizados, atualizamos diretamente na tabela roles
        console.log('Atualizando permissões de Custom Role:', role.name);
        const { error } = await supabase
          .from('roles')
          .update({ permissions })
          .eq('id', roleId);

        if (error) throw error;
      }

      // Atualizar estado local
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
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