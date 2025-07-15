
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRoles } from '@/hooks/useRoles';
import { Shield } from 'lucide-react';

export const RoleManagement = () => {
  const { roles, loading } = useRoles();
  const { toast } = useToast();

  if (loading) {
    return <div className="p-6">Carregando cargos...</div>;
  }

  // Agora roles contém apenas os roles do sistema
  const systemRoles = roles;

  const getPermissionsSummary = (role: any) => {
    if (!role.permissions || Object.keys(role.permissions).length === 0) {
      return 'Permissões padrão';
    }
    
    let totalPermissions = 0;
    let enabledPermissions = 0;
    
    Object.values(role.permissions).forEach((category: any) => {
      Object.values(category).forEach((permission: any) => {
        totalPermissions++;
        if (permission === true) {
          enabledPermissions++;
        }
      });
    });
    
    return `${enabledPermissions}/${totalPermissions} permissões`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cargos do Sistema</h1>
          <p className="text-gray-600">Visualize os cargos disponíveis para sua empresa</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    Sistema
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <CardDescription>{role.description || 'Sem descrição'}</CardDescription>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="text-xs">
                  {getPermissionsSummary(role)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {systemRoles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum cargo do sistema encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o administrador</p>
        </Card>
      )}
    </div>
  );
};
