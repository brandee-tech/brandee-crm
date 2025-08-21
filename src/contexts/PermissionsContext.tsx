import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DEFAULT_PERMISSIONS, RolePermissions, PermissionModule, PermissionAction } from '@/types/permissions';

interface PermissionsContextType {
  userPermissions: RolePermissions | null;
  loading: boolean;
  hasPermission: <T extends PermissionModule>(module: T, action: PermissionAction<T>) => boolean;
  canAccess: (resource: string) => boolean;
  getUserPermissions: () => RolePermissions | null;
  isAdmin: () => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const fetchCustomPermissions = async (roleName: string, companyId: string): Promise<RolePermissions | null> => {
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .eq('company_id', companyId)
      .single();

    if (roleError || !roleData) {
      return null;
    }

    const { data: permissionsData, error: permissionsError } = await supabase
      .from('company_role_permissions')
      .select('permissions')
      .eq('role_id', roleData.id)
      .eq('company_id', companyId)
      .single();

    if (permissionsError || !permissionsData) {
      return null;
    }

    return permissionsData.permissions as unknown as RolePermissions;
  } catch (error) {
    console.error('Error fetching custom permissions:', error);
    return null;
  }
};

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, loading: userLoading } = useCurrentUser();

  const {
    data: customPermissions,
    isLoading: permissionsLoading
  } = useQuery({
    queryKey: ['permissions', userInfo?.role_name, userInfo?.company_id],
    queryFn: () => fetchCustomPermissions(userInfo!.role_name!, userInfo!.company_id!),
    enabled: !!userInfo?.role_name && !!userInfo?.company_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const userPermissions = React.useMemo(() => {
    if (customPermissions) {
      return customPermissions;
    }
    
    if (userInfo?.role_name && DEFAULT_PERMISSIONS[userInfo.role_name]) {
      return DEFAULT_PERMISSIONS[userInfo.role_name];
    }
    
    return null;
  }, [customPermissions, userInfo?.role_name]);

  const hasPermission = React.useCallback(<T extends PermissionModule>(
    module: T,
    action: PermissionAction<T>
  ): boolean => {
    if (!userPermissions) return false;
    return !!userPermissions[module]?.[action as string];
  }, [userPermissions]);

  const resourceMap: Record<string, { module: PermissionModule; action: string }> = {
    leads: { module: 'leads', action: 'view' },
    appointments: { module: 'appointments', action: 'view' },
    tasks: { module: 'tasks', action: 'view' },
    meetings: { module: 'meetings', action: 'view' },
    partners: { module: 'partners', action: 'view' },
    products: { module: 'products', action: 'view' },
    contacts: { module: 'contacts', action: 'view' },
    scripts: { module: 'scripts', action: 'view' },
    reports: { module: 'reports', action: 'view' },
    settings: { module: 'admin', action: 'manage_settings' },
    admin: { module: 'admin', action: 'manage_users' },
  };

  const canAccess = React.useCallback((resource: string): boolean => {
    const mapping = resourceMap[resource];
    if (!mapping) return false;
    return hasPermission(mapping.module, mapping.action as PermissionAction<typeof mapping.module>);
  }, [hasPermission]);

  const getUserPermissions = React.useCallback(() => userPermissions, [userPermissions]);

  const isAdmin = React.useCallback(() => {
    if (!userPermissions) return false;
    return !!(userPermissions.admin?.manageUsers || userPermissions.admin?.manageRoles);
  }, [userPermissions]);

  const contextValue: PermissionsContextType = {
    userPermissions,
    loading: userLoading || permissionsLoading,
    hasPermission,
    canAccess,
    getUserPermissions,
    isAdmin,
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};