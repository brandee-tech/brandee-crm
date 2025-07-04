import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useSaasRoles } from '@/hooks/useSaasRoles';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useToast } from '@/hooks/use-toast';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedCompanyId?: string;
}

export const CreateUserDialog = ({ open, onOpenChange, onSuccess, preselectedCompanyId }: CreateUserDialogProps) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_id: '',
    role_id: ''
  });
  const [loading, setLoading] = useState(false);

  const { companies } = useAllCompanies();
  const { roles } = useSaasRoles(formData.company_id);
  const { createUserInvitation } = useSaasProfiles();
  const { toast } = useToast();

  useEffect(() => {
    if (preselectedCompanyId) {
      setFormData(prev => ({ ...prev, company_id: preselectedCompanyId }));
    }
  }, [preselectedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.company_id || !formData.role_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createUserInvitation(formData.email, formData.company_id, formData.role_id, formData.full_name);
      onSuccess();
      onOpenChange(false);
      setFormData({
        email: '',
        full_name: '',
        company_id: '',
        role_id: ''
      });
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nome do usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa *</Label>
            <Select 
              value={formData.company_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value, role_id: '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Cargo *</Label>
            <Select 
              value={formData.role_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} {role.is_system_role && '(Sistema)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};