
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRoles } from '@/hooks/useRoles';
import { RolePermissionsDialog } from './RolePermissionsDialog';
import { Plus, Edit, Trash2, Settings, Shield } from 'lucide-react';

export const RoleManagement = () => {
  const { roles, loading, createRole, updateRole, updateRolePermissions, deleteRole } = useRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  // Filtrar apenas cargos da empresa (os cargos do sistema agora são controlados pelo RLS)
  const companyRoles = roles.filter(role => !role.is_system_role);

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
          <h1 className="text-3xl font-bold">Gerenciamento de Cargos</h1>
          <p className="text-gray-600">Gerencie os cargos da sua empresa</p>
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
                {editingRole ? 'Edite as informações do cargo' : 'Crie um novo cargo personalizado para sua empresa'}
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
        {companyRoles.map((role) => (
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
      </div>

      {companyRoles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum cargo personalizado encontrado</p>
          <p className="text-gray-400 mt-2">Sua empresa já possui os cargos padrão (Admin, SDR, Closer)</p>
        </Card>
      )}
    </div>
  );
};
