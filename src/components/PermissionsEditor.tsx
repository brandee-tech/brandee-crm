import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RolePermissions, DEFAULT_PERMISSIONS } from '@/types/permissions';
import { 
  Users, 
  Calendar, 
  CalendarDays, 
  CheckSquare, 
  ContactRound, 
  FileText, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface PermissionsEditorProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
  roleName?: string;
}

const PERMISSION_CATEGORIES = {
  leads: {
    label: 'Leads',
    icon: Users,
    permissions: [
      { key: 'view', label: 'Ver leads' },
      { key: 'create', label: 'Criar leads' },
      { key: 'edit', label: 'Editar leads' },
      { key: 'delete', label: 'Deletar leads' },
      { key: 'assign', label: 'Atribuir leads' },
      { key: 'export', label: 'Exportar leads' },
      { key: 'import', label: 'Importar leads' }
    ]
  },
  appointments: {
    label: 'Compromissos',
    icon: Calendar,
    permissions: [
      { key: 'view', label: 'Ver compromissos' },
      { key: 'create', label: 'Criar compromissos' },
      { key: 'edit', label: 'Editar compromissos' },
      { key: 'delete', label: 'Deletar compromissos' },
      { key: 'viewAll', label: 'Ver todos os compromissos' }
    ]
  },
  meetings: {
    label: 'Reuniões',
    icon: CalendarDays,
    permissions: [
      { key: 'view', label: 'Ver reuniões' },
      { key: 'create', label: 'Criar reuniões' },
      { key: 'edit', label: 'Editar reuniões' },
      { key: 'delete', label: 'Deletar reuniões' },
      { key: 'moderate', label: 'Moderar reuniões' }
    ]
  },
  tasks: {
    label: 'Tarefas',
    icon: CheckSquare,
    permissions: [
      { key: 'view', label: 'Ver tarefas' },
      { key: 'create', label: 'Criar tarefas' },
      { key: 'edit', label: 'Editar tarefas' },
      { key: 'delete', label: 'Deletar tarefas' },
      { key: 'assign', label: 'Atribuir tarefas' }
    ]
  },
  contacts: {
    label: 'Contatos',
    icon: ContactRound,
    permissions: [
      { key: 'view', label: 'Ver contatos' },
      { key: 'create', label: 'Criar contatos' },
      { key: 'edit', label: 'Editar contatos' },
      { key: 'delete', label: 'Deletar contatos' }
    ]
  },
  scripts: {
    label: 'Scripts',
    icon: FileText,
    permissions: [
      { key: 'view', label: 'Ver scripts' },
      { key: 'create', label: 'Criar scripts' },
      { key: 'edit', label: 'Editar scripts' },
      { key: 'delete', label: 'Deletar scripts' }
    ]
  },
  reports: {
    label: 'Relatórios',
    icon: BarChart3,
    permissions: [
      { key: 'view', label: 'Ver relatórios' },
      { key: 'export', label: 'Exportar relatórios' },
      { key: 'advanced', label: 'Relatórios avançados' }
    ]
  },
  admin: {
    label: 'Administração',
    icon: Settings,
    permissions: [
      { key: 'manageUsers', label: 'Gerenciar usuários' },
      { key: 'manageRoles', label: 'Gerenciar cargos' },
      { key: 'companySettings', label: 'Configurações da empresa' },
      { key: 'systemSettings', label: 'Configurações do sistema' }
    ]
  }
};

export const PermissionsEditor: React.FC<PermissionsEditorProps> = ({ 
  permissions, 
  onChange,
  roleName 
}) => {
  const [currentPermissions, setCurrentPermissions] = useState<RolePermissions>(permissions);

  const handlePermissionChange = (
    category: keyof RolePermissions,
    permission: string,
    checked: boolean
  ) => {
    const newPermissions = {
      ...currentPermissions,
      [category]: {
        ...currentPermissions[category],
        [permission]: checked
      }
    };
    setCurrentPermissions(newPermissions);
    onChange(newPermissions);
  };

  const applyPreset = (presetName: string) => {
    const preset = DEFAULT_PERMISSIONS[presetName];
    if (preset) {
      setCurrentPermissions(preset);
      onChange(preset);
    }
  };

  const getTotalPermissions = () => {
    let total = 0;
    let enabled = 0;
    
    Object.entries(PERMISSION_CATEGORIES).forEach(([category, config]) => {
      config.permissions.forEach(({ key }) => {
        total++;
        if ((currentPermissions as any)[category]?.[key]) {
          enabled++;
        }
      });
    });
    
    return { total, enabled };
  };

  const { total, enabled } = getTotalPermissions();

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Configurar Permissões{roleName && ` - ${roleName}`}
          </h3>
          <p className="text-sm text-gray-600">
            {enabled} de {total} permissões habilitadas
          </p>
        </div>
        
        {/* Presets */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('Admin')}
            className="text-xs"
          >
            Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('SDR')}
            className="text-xs"
          >
            SDR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('Closer')}
            className="text-xs"
          >
            Closer
          </Button>
        </div>
      </div>

      {/* Grade de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
          const IconComponent = category.icon;
          const categoryPerms = (currentPermissions as any)[categoryKey];
          const enabledInCategory = category.permissions.filter(p => categoryPerms?.[p.key]).length;
          
          return (
            <Card key={categoryKey} className="p-4">
              <CardHeader className="pb-3 px-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-sm">{category.label}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {enabledInCategory}/{category.permissions.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="px-0 space-y-3">
                {category.permissions.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${categoryKey}-${key}`}
                      checked={categoryPerms?.[key] || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(categoryKey as keyof RolePermissions, key, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`${categoryKey}-${key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};