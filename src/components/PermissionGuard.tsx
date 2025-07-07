import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
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

  // Verificação simplificada para evitar problemas de tipos
  const hasAccess = (() => {
    const permissions = usePermissions().getUserPermissions();
    if (!permissions) return false;
    
    const modulePerms = permissions[module];
    if (!modulePerms) return false;
    
    return (modulePerms as any)[action] === true;
  })();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};