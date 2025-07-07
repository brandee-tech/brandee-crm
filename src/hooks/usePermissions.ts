import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { RolePermissions, DEFAULT_PERMISSIONS, PermissionModule, PermissionAction } from '@/types/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();

  const userPermissions = useMemo((): RolePermissions | null => {
    if (!userInfo?.role_name) return null;

    // Caso contrário, usar permissões padrão baseadas no nome do cargo
    const defaultPerms = DEFAULT_PERMISSIONS[userInfo.role_name];
    if (defaultPerms) {
      return defaultPerms;
    }

    // Se não encontrar, dar permissões básicas de SDR por segurança
    return DEFAULT_PERMISSIONS['SDR'];
  }, [userInfo]);

  const hasPermission = <T extends PermissionModule>(
    module: T,
    action: PermissionAction<T>
  ): boolean => {
    if (!userPermissions) return false;
    return userPermissions[module]?.[action] === true;
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