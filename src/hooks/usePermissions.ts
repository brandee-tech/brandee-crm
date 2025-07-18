import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { RolePermissions, DEFAULT_PERMISSIONS, PermissionModule, PermissionAction } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const [customPermissions, setCustomPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar permissões customizadas da empresa
  useEffect(() => {
    const fetchCustomPermissions = async () => {
      if (!userInfo?.company_id || !userInfo?.role_name) {
        setLoading(false);
        return;
      }

      try {
        // Buscar role_id baseado no nome do cargo
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', userInfo.role_name)
          .eq('is_system_role', true)
          .single();

        if (roleError || !roleData) {
          console.log('❌ [DEBUG] Role não encontrado:', userInfo.role_name);
          setLoading(false);
          return;
        }

        // Buscar permissões customizadas para este cargo na empresa
        const { data: permData, error: permError } = await supabase
          .from('company_role_permissions')
          .select('permissions')
          .eq('company_id', userInfo.company_id)
          .eq('role_id', roleData.id)
          .maybeSingle();

        if (permError) {
          console.error('❌ [DEBUG] Erro ao buscar permissões customizadas:', permError);
          setLoading(false);
          return;
        }

        if (permData?.permissions) {
          console.log('✅ [DEBUG] Permissões customizadas encontradas para:', userInfo.role_name);
          setCustomPermissions(permData.permissions as unknown as RolePermissions);
        } else {
          console.log('ℹ️ [DEBUG] Usando permissões padrão para:', userInfo.role_name);
          setCustomPermissions(null);
        }
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao buscar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomPermissions();
  }, [userInfo?.company_id, userInfo?.role_name]);

  const userPermissions = useMemo((): RolePermissions | null => {
    console.log('🔍 [DEBUG] usePermissions - userInfo:', userInfo);
    
    // Se não tem userInfo, retorna null
    if (!userInfo) {
      console.log('❌ [DEBUG] usePermissions - Sem userInfo');
      return null;
    }

    // Priorizar permissões customizadas da empresa
    if (customPermissions) {
      console.log('✅ [DEBUG] usePermissions - Usando permissões customizadas para:', userInfo.role_name);
      return customPermissions;
    }

    // Fallback para permissões padrão
    if (userInfo.role_name) {
      console.log('✅ [DEBUG] usePermissions - Usando permissões padrão para:', userInfo.role_name);
      const defaultPerms = DEFAULT_PERMISSIONS[userInfo.role_name];
      if (defaultPerms) {
        return defaultPerms;
      }
    }

    // Se não tem role_name ou role não encontrado, usar SDR como fallback
    console.log('⚠️ [DEBUG] usePermissions - Usando SDR como fallback para role:', userInfo.role_name);
    return DEFAULT_PERMISSIONS['SDR'];
  }, [userInfo, customPermissions]);

  const hasPermission = <T extends PermissionModule>(
    module: T,
    action: PermissionAction<T>
  ): boolean => {
    if (!userPermissions) {
      console.log('❌ [DEBUG] hasPermission - Sem permissões definidas');
      return false;
    }
    const hasAccess = userPermissions[module]?.[action] === true;
    console.log(`🔐 [DEBUG] hasPermission - ${module}.${String(action)}: ${hasAccess}`);
    return hasAccess;
  };

  const canAccess = (resource: string): boolean => {
    if (!userPermissions) return false;

    // Mapeamento de recursos para permissões
    const resourceMap: Record<string, { module: PermissionModule; action: string }> = {
      'leads': { module: 'leads', action: 'view' },
      'appointments': { module: 'appointments', action: 'view' },
      'meetings': { module: 'meetings', action: 'view' },
      'tasks': { module: 'tasks', action: 'view' },
      'contacts': { module: 'contacts', action: 'view' },
      'scripts': { module: 'scripts', action: 'view' },
      'reports': { module: 'reports', action: 'view' },
      'settings': { module: 'admin', action: 'companySettings' },
      'user-management': { module: 'admin', action: 'manageUsers' },
      'role-management': { module: 'admin', action: 'manageRoles' }
    };

    const permission = resourceMap[resource];
    if (!permission) return true; // Se não está mapeado, permitir acesso

    return hasPermission(permission.module as any, permission.action as any);
  };

  const getUserPermissions = (): RolePermissions | null => {
    return userPermissions;
  };

  const isAdmin = (): boolean => {
    return hasPermission('admin', 'manageUsers') || hasPermission('admin', 'manageRoles');
  };

  return {
    hasPermission,
    canAccess,
    getUserPermissions,
    isAdmin,
    userPermissions,
    loading
  };
};