
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any;
  is_system_role: boolean;
  created_at: string;
}

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        // Atualizar cargo existente
        const { error } = await supabase
          .from('roles')
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq('id', editingRole.id);

        if (error) throw error;
        
        toast({
          title: 'Cargo atualizado com sucesso!',
        });
      } else {
        // Criar novo cargo
        const { error } = await supabase
          .from('roles')
          .insert({
            name: formData.name,
            description: formData.description,
            permissions: {},
            is_system_role: false,
          });

        if (error) throw error;
        
        toast({
          title: 'Cargo criado com sucesso!',
        });
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cargo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system_role) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir cargos do sistema',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      try {
        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', role.id);

        if (error) throw error;
        
        toast({
          title: 'Cargo excluído com sucesso!',
        });
        
        fetchRoles();
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir cargo',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div className="p-6">Carregando cargos...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Cargos</h1>
          <p className="text-gray-600">Gerencie os cargos e permissões do sistema</p>
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
                {editingRole ? 'Edite as informações do cargo' : 'Crie um novo cargo personalizado'}
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
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  {role.is_system_role && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                      Cargo do Sistema
                    </span>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {!role.is_system_role && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(role)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription>{role.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
