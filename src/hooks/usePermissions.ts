import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { RolePermissions, DEFAULT_PERMISSIONS, PermissionModule, PermissionAction } from '@/types/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();

  const userPermissions = useMemo((): RolePermissions | null => {
    console.log('🔍 [DEBUG] usePermissions - userInfo:', userInfo);
    
    // Se não tem userInfo, retorna null
    if (!userInfo) {
      console.log('❌ [DEBUG] usePermissions - Sem userInfo');
      return null;
    }

    // Se tem role_name, usar permissões específicas
    if (userInfo.role_name) {
      console.log('✅ [DEBUG] usePermissions - Role encontrado:', userInfo.role_name);
      const defaultPerms = DEFAULT_PERMISSIONS[userInfo.role_name];
      if (defaultPerms) {
        return defaultPerms;
      }
    }

    // Se não tem role_name ou role não encontrado, usar SDR como fallback
    console.log('⚠️ [DEBUG] usePermissions - Usando SDR como fallback para role:', userInfo.role_name);
    return DEFAULT_PERMISSIONS['SDR'];
  }, [userInfo]);

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
    userPermissions
  };
};