import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import { PermissionsEditor } from './PermissionsEditor';
import { RolePermissions, DEFAULT_PERMISSIONS } from '@/types/permissions';

interface RolePermissionsDialogProps {
  role: {
    id: string;
    name: string;
    permissions?: any;
  };
  onUpdatePermissions: (roleId: string, permissions: RolePermissions) => Promise<void>;
}

export const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({
  role,
  onUpdatePermissions
}) => {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<RolePermissions>(() => {
    // Usar permissões customizadas se existirem, senão usar padrão baseado no nome
    if (role.permissions && Object.keys(role.permissions).length > 0) {
      return role.permissions as RolePermissions;
    }
    return DEFAULT_PERMISSIONS[role.name] || DEFAULT_PERMISSIONS['SDR'];
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdatePermissions(role.id, permissions);
      
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso"
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-1" />
          Permissões
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Permissões</DialogTitle>
          <DialogDescription>
            Configure as permissões para o cargo <strong>{role.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <PermissionsEditor
            permissions={permissions}
            onChange={setPermissions}
            roleName={role.name}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};