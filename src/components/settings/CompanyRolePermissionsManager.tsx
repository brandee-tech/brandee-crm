import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Shield, Settings, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { useCompanyRolePermissions } from '@/hooks/useCompanyRolePermissions';
import { DEFAULT_PERMISSIONS, RolePermissions, PermissionModule } from '@/types/permissions';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MODULE_LABELS: Record<PermissionModule, string> = {
  leads: 'Leads',
  appointments: 'Agendamentos',
  meetings: 'Reuniões',
  tasks: 'Tarefas',
  contacts: 'Contatos',
  scripts: 'Scripts',
  partners: 'Parceiros',
  reports: 'Relatórios',
  scheduleBlocks: 'Bloqueios de Agenda',
  admin: 'Administração'
};

const ACTION_LABELS = {
  view: { label: 'Visualizar', icon: Eye },
  create: { label: 'Criar', icon: Plus },
  edit: { label: 'Editar', icon: Edit },
  delete: { label: 'Excluir', icon: Trash2 },
  assign: { label: 'Atribuir', icon: Settings },
  export: { label: 'Exportar', icon: Settings },
  import: { label: 'Importar', icon: Settings },
  viewAll: { label: 'Ver Todos', icon: Eye },
  moderate: { label: 'Moderar', icon: Settings },
  advanced: { label: 'Avançado', icon: Settings },
  manageUsers: { label: 'Gerenciar Usuários', icon: Settings },
  manageRoles: { label: 'Gerenciar Cargos', icon: Shield },
  companySettings: { label: 'Configurações da Empresa', icon: Settings },
  systemSettings: { label: 'Configurações do Sistema', icon: Settings }
};

export const CompanyRolePermissionsManager = () => {
  const { roles, loading, updateRolePermissions, getRolePermissions } = useCompanyRolePermissions();
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [localPermissions, setLocalPermissions] = useState<Record<string, RolePermissions>>({});

  console.log('🔍 [DEBUG] CompanyRolePermissionsManager - Estado:', { 
    rolesCount: roles.length, 
    loading, 
    roles: roles.map(r => ({ id: r.id, name: r.name }))
  });

  const toggleRoleExpansion = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const getCurrentPermissions = (roleId: string): RolePermissions => {
    if (localPermissions[roleId]) {
      return localPermissions[roleId];
    }
    
    const customPermissions = getRolePermissions(roleId);
    if (customPermissions) {
      return customPermissions;
    }

    const role = roles.find(r => r.id === roleId);
    if (role && DEFAULT_PERMISSIONS[role.name]) {
      return DEFAULT_PERMISSIONS[role.name];
    }

    return DEFAULT_PERMISSIONS['SDR'];
  };

  const updatePermission = (roleId: string, module: PermissionModule, action: string, value: boolean) => {
    const currentPerms = getCurrentPermissions(roleId);
    const newPerms = {
      ...currentPerms,
      [module]: {
        ...currentPerms[module],
        [action]: value
      }
    };
    
    setLocalPermissions(prev => ({
      ...prev,
      [roleId]: newPerms
    }));
  };

  const saveRolePermissions = async (roleId: string) => {
    const permissions = localPermissions[roleId];
    if (permissions) {
      await updateRolePermissions(roleId, permissions);
      // Remove from local state after saving
      setLocalPermissions(prev => {
        const newState = { ...prev };
        delete newState[roleId];
        return newState;
      });
    }
  };

  const resetToDefaults = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && DEFAULT_PERMISSIONS[role.name]) {
      setLocalPermissions(prev => ({
        ...prev,
        [roleId]: DEFAULT_PERMISSIONS[role.name]
      }));
    }
  };

  const hasUnsavedChanges = (roleId: string): boolean => {
    return localPermissions[roleId] !== undefined;
  };

  const getPermissionCount = (roleId: string): { total: number, enabled: number } => {
    const permissions = getCurrentPermissions(roleId);
    let total = 0;
    let enabled = 0;

    Object.entries(permissions).forEach(([, modulePerms]) => {
      Object.entries(modulePerms).forEach(([, value]) => {
        total++;
        if (value) enabled++;
      });
    });

    return { total, enabled };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Permissões dos Cargos</h3>
        <p className="text-sm text-muted-foreground">
          Configure as permissões específicas para cada cargo em sua empresa.
        </p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => {
          const { total, enabled } = getPermissionCount(role.id);
          const isExpanded = expandedRoles.has(role.id);
          const unsavedChanges = hasUnsavedChanges(role.id);
          
          return (
            <Card key={role.id} className={unsavedChanges ? 'border-orange-200 bg-orange-50/50' : ''}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleRoleExpansion(role.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <Shield className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">{role.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {enabled} de {total} permissões ativas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unsavedChanges && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Alterações não salvas
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {Math.round((enabled / total) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {Object.entries(MODULE_LABELS).map(([module, label]) => {
                        const modulePerms = getCurrentPermissions(role.id)[module as PermissionModule];
                        
                        return (
                          <div key={module} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{label}</h4>
                              <Separator className="flex-1" />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(modulePerms).map(([action, value]) => {
                                const actionConfig = ACTION_LABELS[action as keyof typeof ACTION_LABELS];
                                if (!actionConfig) return null;
                                
                                const Icon = actionConfig.icon;
                                
                                return (
                                  <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${role.id}-${module}-${action}`}
                                      checked={value}
                                      onCheckedChange={(checked) => 
                                        updatePermission(role.id, module as PermissionModule, action, !!checked)
                                      }
                                    />
                                    <label
                                      htmlFor={`${role.id}-${module}-${action}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Icon className="w-3 h-3" />
                                      {actionConfig.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {unsavedChanges && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetToDefaults(role.id)}
                          >
                            Restaurar Padrão
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLocalPermissions(prev => {
                                  const newState = { ...prev };
                                  delete newState[role.id];
                                  return newState;
                                });
                              }}
                            >
                              Cancelar
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm">
                                  Salvar Alterações
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja salvar as alterações nas permissões do cargo "{role.name}"? 
                                    Esta ação afetará todos os usuários com este cargo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => saveRolePermissions(role.id)}>
                                    Salvar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};