
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfiles } from '@/hooks/useProfiles';
import { useRoles } from '@/hooks/useRoles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Building2, Mail, Crown, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InviteUserDialog } from '@/components/InviteUserDialog';
import { InvitationsTable } from '@/components/InvitationsTable';
import { PermissionGuard } from '@/components/PermissionGuard';

export const UserManagement = () => {
  const { profiles, loading, updateProfile, deleteProfile } = useProfiles();
  const { roles } = useRoles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário atual é admin usando a função do banco
  useEffect(() => {
    const checkAdminPermission = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.rpc('is_current_user_admin');
          if (error) throw error;
          setIsAdmin(data || false);
        } catch (error) {
          console.error('Erro ao verificar permissões de admin:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminPermission();
  }, [user]);

  const handleRoleChange = async () => {
    if (!editingUser || !selectedRole) return;

    try {
      await updateProfile(editingUser.id, { role_id: selectedRole });
      setDialogOpen(false);
      setEditingUser(null);
      setSelectedRole('');
      toast({
        title: "Sucesso",
        description: "Cargo do usuário atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cargo"
      });
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Closer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SDR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className=" space-y-6">


      <PermissionGuard module="admin" action="manageUsers">
        <div className="mb-6">
          <InvitationsTable />
        </div>
      </PermissionGuard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profile.full_name || 'Usuário'}</CardTitle>
                    {profile.id === user?.id && (
                      <Crown className="w-4 h-4 text-yellow-500 inline ml-1" />
                    )}
                  </div>
                </div>

                <PermissionGuard module="admin" action="manageUsers">
                  {profile.id !== user?.id && (
                    <div className="flex items-center gap-1">
                      <Dialog open={dialogOpen && editingUser?.id === profile.id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(profile);
                              setSelectedRole(profile.role_id || '');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Alterar Cargo</DialogTitle>
                            <DialogDescription>
                              Altere o cargo de {profile.full_name || profile.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um cargo" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleRoleChange}>
                                Salvar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o usuário <strong>{profile.full_name || profile.email}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProfile(profile.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </PermissionGuard>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {profile.email}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                {profile.companies?.name || 'Empresa não definida'}
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getRoleBadgeColor(profile.roles?.name || 'Usuário')}>
                  {profile.roles?.name || 'Sem cargo'}
                </Badge>

                {profile.companies?.plan && (
                  <span className="text-xs text-gray-500 capitalize">
                    Plano: {profile.companies.plan}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum usuário encontrado na sua empresa</p>
          <p className="text-gray-400 mt-2">Convide novos usuários para sua empresa</p>
        </Card>
      )}
    </div>
  );
};
