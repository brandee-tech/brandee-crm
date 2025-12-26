
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { UserManagement } from '@/components/UserManagement';


export const UserRoleManagement = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <UserManagement />
      </div>
    </div>
  );
};
