import React from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';
import { PermissionModule, PermissionAction } from '@/types/permissions';

interface PermissionGuardProps {
  module: PermissionModule;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback = null,
  showFallback = true
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = hasPermission(module, action as PermissionAction<typeof module>);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};