import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useSaasRoles } from '@/hooks/useSaasRoles';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedCompanyId?: string;
}

export const CreateUserDialog = ({ open, onOpenChange, onSuccess, preselectedCompanyId }: CreateUserDialogProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_id: '',
    role_id: '',
    is_super_admin: false,
    n8n_url: ''
  });
  const [loading, setLoading] = useState(false);

  const { companies } = useAllCompanies();
  const { roles } = useSaasRoles();
  const { toast } = useToast();

  useEffect(() => {
    if (preselectedCompanyId) {
      setFormData(prev => ({ ...prev, company_id: preselectedCompanyId }));
    }
  }, [preselectedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Para usuários de empresa, company_id e role_id são obrigatórios
    if (!formData.is_super_admin && (!formData.company_id || !formData.role_id)) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa e cargo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar nome do cargo se não for super admin
      let roleName = 'Super Admin';
      if (!formData.is_super_admin && formData.role_id) {
        const role = roles.find(r => r.id === formData.role_id);
        roleName = role?.name || 'Admin';
      }

      // URL do webhook
      const webhookUrl = 'https://webhook.sparkassessoria.com/webhook/09705cd4-3e37-42f4-ac3d-57ac99ed8292';

      console.log('Enviando dados para webhook:', {
        nome: formData.full_name,
        email: formData.email,
        senha: formData.password,
        cargo: roleName
      });

      // Enviar para webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          nome: formData.full_name,
          email: formData.email,
          senha: formData.password,
          cargo: roleName
        }),
      });

      console.log('Resposta do webhook:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do webhook:', errorText);
        throw new Error(`Erro do servidor webhook: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.text();
      console.log('Dados de resposta do webhook:', responseData);

      toast({
        title: "Dados enviados com sucesso!",
        description: `Informações de ${formData.email} foram enviadas para o webhook`
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        company_id: '',
        role_id: '',
        is_super_admin: false,
        n8n_url: ''
      });
    } catch (error: any) {
      console.error('Erro ao enviar dados para webhook:', error);
      toast({
        title: "Erro ao enviar dados",
        description: error.message || "Ocorreu um erro inesperado ao enviar para webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
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
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Senha do usuário (mín. 6 caracteres)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Nome do usuário"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_super_admin"
                checked={formData.is_super_admin}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    is_super_admin: checked === true,
                    company_id: checked === true ? '' : prev.company_id,
                    role_id: checked === true ? '' : prev.role_id
                  }))
                }
              />
              <Label htmlFor="is_super_admin" className="text-sm font-medium">
                Super Administrador (acesso total ao sistema)
              </Label>
            </div>
          </div>

          {!formData.is_super_admin && (
            <>
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
                    {roles.filter(role => role.name !== 'Administrador do Sistema').map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Enviando...' : 'Enviar para Webhook'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};