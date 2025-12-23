
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { UserManagement } from '@/components/UserManagement';


export const UserRoleManagement = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
        </div>
        <UserManagement />
      </div>
    </div>
  );
};
