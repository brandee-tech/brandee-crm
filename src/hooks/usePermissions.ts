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
      // Se não tem userInfo ou não tem role_name, usar permissões padrão
      if (!userInfo?.role_name) {
        console.log('ℹ️ [DEBUG] Usuário sem role_name, usando permissões padrão');
        setCustomPermissions(null);
        setLoading(false);
        return;
      }

      // Se não tem empresa, usar permissões padrão (usuário ainda não configurou empresa)
      if (!userInfo?.company_id) {
        console.log('ℹ️ [DEBUG] Usuário sem empresa, usando permissões padrão para:', userInfo.role_name);
        setCustomPermissions(null);
        setLoading(false);
        return;
      }

      try {
        // 1. Buscar definição do cargo (incluindo is_system_role e permissions)
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id, is_system_role, permissions')
          .eq('name', userInfo.role_name)
          .maybeSingle(); // Usar maybeSingle pois pode haver múltiplos roles com mesmo nome (um sistema e um custom em outra empresa), mas aqui assumimos nome único por contexto ou refinaremos a query se necessário.
        // Melhoria: Se for custom role, deveria filtrar por company_id. 
        // Mas como role_name é usado como chave aqui, vamos tentar buscar um que combine.


        // Refinado: Buscar role que corresponda ao nome E (seja do sistema OU seja da empresa do usuário)
        const { data: exactRoleData, error: exactRoleError } = await supabase
          .from('roles')
          .select('id, is_system_role, permissions')
          .eq('name', userInfo.role_name)
          .or(`company_id.eq.${userInfo.company_id},is_system_role.eq.true`)
          .order('is_system_role', { ascending: false }) // Priorizar sistema se houver ambiguidade, ou refinar lógica
          .limit(1)
          .single();

        if (exactRoleError || !exactRoleData) {
          console.log('ℹ️ [DEBUG] Role não encontrado ou erro:', userInfo.role_name, exactRoleError);
          // Fallback para padrão
          setCustomPermissions(null);
          setLoading(false);
          return;
        }

        // 2. Lógica de Permissões
        if (exactRoleData.is_system_role) {
          // Cargo de Sistema: Verificar se há override na tabela company_role_permissions
          const { data: overrideData, error: overrideError } = await supabase
            .from('company_role_permissions')
            .select('permissions')
            .eq('company_id', userInfo.company_id)
            .eq('role_id', exactRoleData.id)
            .maybeSingle();

          if (overrideError) {
            console.log('ℹ️ [DEBUG] Erro ao buscar override:', overrideError);
          }

          if (overrideData?.permissions) {
            console.log('✅ [DEBUG] Permissões customizadas (Override) encontradas para System Role:', userInfo.role_name);
            setCustomPermissions(overrideData.permissions as unknown as RolePermissions);
          } else {
            console.log('ℹ️ [DEBUG] Sem override para System Role, usando padrão/definição base:', userInfo.role_name);
            // Se o role do sistema tiver permissões definidas no banco, poderíamos usar `exactRoleData.permissions`
            // Mas por compatibilidade atual, mantemos null para cair no DEFAULT_PERMISSIONS hardcoded ou usamos exactRoleData.permissions se não vazio
            if (exactRoleData.permissions && Object.keys(exactRoleData.permissions).length > 0) {
              setCustomPermissions(exactRoleData.permissions as unknown as RolePermissions);
            } else {
              setCustomPermissions(null);
            }
          }

        } else {
          // Cargo Customizado: Usar permissões definidas na própria tabela roles
          if (exactRoleData.permissions) {
            console.log('✅ [DEBUG] Permissões encontradas para Custom Role:', userInfo.role_name);
            setCustomPermissions(exactRoleData.permissions as unknown as RolePermissions);
          } else {
            console.log('⚠️ [DEBUG] Custom Role sem permissões definidas?', userInfo.role_name);
            setCustomPermissions(null);
          }
        }

      } catch (error) {
        console.log('ℹ️ [DEBUG] Erro ao buscar permissões:', error);
        setCustomPermissions(null);
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