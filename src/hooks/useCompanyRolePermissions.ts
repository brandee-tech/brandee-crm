import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';
import { RolePermissions } from '@/types/permissions';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface CompanyRolePermission {
  id: string;
  company_id: string;
  role_id: string;
  permissions: Json;
  created_at: string;
  updated_at: string;
}

export const useCompanyRolePermissions = () => {
  const { userInfo } = useCurrentUser();
  const [permissions, setPermissions] = useState<CompanyRolePermission[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    if (!userInfo?.company_id) {
      console.log('❌ [DEBUG] fetchRoles - Sem company_id:', userInfo);
      return;
    }

    console.log('🔍 [DEBUG] fetchRoles - Buscando roles para company_id:', userInfo.company_id);

    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_system_role', true)
        .order('name');

      console.log('✅ [DEBUG] fetchRoles - Resultado:', { data, error });

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('❌ [DEBUG] fetchRoles - Error:', error);
      toast.error('Erro ao carregar cargos');
    }
  };

  const fetchPermissions = async () => {
    if (!userInfo?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('company_role_permissions')
        .select(`
          *,
          roles!inner(name, id, is_system_role)
        `)
        .eq('company_id', userInfo.company_id)
        .eq('roles.is_system_role', true);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const updateRolePermissions = async (roleId: string, newPermissions: RolePermissions) => {
    if (!userInfo?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('company_role_permissions')
        .upsert({
          company_id: userInfo.company_id,
          role_id: roleId,
          permissions: newPermissions as unknown as Json
        }, {
          onConflict: 'company_id,role_id'
        })
        .select();

      if (error) throw error;

      // Atualizar estado local
      setPermissions(prev => {
        const existing = prev.find(p => p.role_id === roleId);
        if (existing) {
          return prev.map(p => 
            p.role_id === roleId 
              ? { ...p, permissions: newPermissions as unknown as Json, updated_at: new Date().toISOString() }
              : p
          );
        } else {
          return [...prev, data[0]];
        }
      });

      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  const getRolePermissions = (roleId: string): RolePermissions | null => {
    const permission = permissions.find(p => p.role_id === roleId);
    return permission?.permissions as unknown as RolePermissions || null;
  };

  useEffect(() => {
    if (userInfo?.company_id) {
      fetchRoles();
      fetchPermissions();
    }
  }, [userInfo?.company_id]);

  return {
    permissions,
    roles,
    loading,
    updateRolePermissions,
    getRolePermissions,
    refetch: () => {
      fetchRoles();
      fetchPermissions();
    }
  };
};