import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { RolePermissionsDialog } from '../RolePermissionsDialog';
import { Plus, Edit, Trash2, Shield, Lock } from 'lucide-react';

interface AdminRoleManagementProps {
  companyId: string;
  companyName: string;
}

export const AdminRoleManagement = ({ companyId, companyName }: AdminRoleManagementProps) => {
  const { roles, loading, createRole, updateRole, updateRolePermissions, deleteRole } = useAdminRoles(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        await createRole({
          name: formData.name,
          description: formData.description,
        });
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (role: any) => {
    if (role.is_system_role) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir cargos do sistema',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      await deleteRole(role.id);
    }
  };

  if (loading) {
    return <div className="p-6">Carregando cargos...</div>;
  }

  const systemRoles = roles.filter(role => role.is_system_role);
  const customRoles = roles.filter(role => !role.is_system_role);

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
    <div className="space-y-8">
      {/* Seção de Cargos do Sistema */}
      <section className="space-y-4">

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemRoles.map((role) => (
            <Card key={role.id} className="border-blue-100 bg-blue-50/10">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {role.name}
                      <Badge variant="secondary" className="text-[10px] h-5">Sistema</Badge>
                    </CardTitle>
                  </div>

                  <div className="flex gap-1">
                    <RolePermissionsDialog
                      role={role}
                      onUpdatePermissions={updateRolePermissions}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <CardDescription>{role.description || 'Cargo padrão do sistema'}</CardDescription>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-gray-400" />
                  <Badge variant="outline" className="text-xs bg-white">
                    {getPermissionsSummary(role)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100 my-4"></div>

      {/* Seção de Cargos Personalizados */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Cargos Personalizados</h3>
            <p className="text-sm text-gray-600">Gerencie os cargos personalizados de {companyName}</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRole(null);
                setFormData({ name: '', description: '' });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cargo
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Editar Cargo' : 'Novo Cargo'}
                </DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Edite as informações do cargo' : `Crie um novo cargo personalizado para ${companyName}`}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Cargo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição das responsabilidades do cargo..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRole ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <RolePermissionsDialog
                      role={role}
                      onUpdatePermissions={updateRolePermissions}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(role)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

          {customRoles.length === 0 && (
            <Card className="col-span-full p-8 text-center bg-gray-50 border-dashed">
              <p className="text-gray-500">Nenhum cargo personalizado criado ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Crie cargos específicos para as necessidades da sua empresa.</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};