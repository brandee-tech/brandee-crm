import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { UserManagement } from '@/components/UserManagement';
import { AdminRoleManagement } from '@/components/admin/AdminRoleManagement';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

export const UserRoleManagement = () => {
  const { company, isLoading } = useCurrentCompany();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Usuários & Cargos
        </h3>
        <p className="text-sm text-gray-600">
          Gerencie os usuários e cargos da sua equipe
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cargos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {company && (
            <AdminRoleManagement
              companyId={company.id}
              companyName={company.name}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
