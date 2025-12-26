
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

interface InviteUserDialogProps {
  onUserCreated?: () => void;
}

export const InviteUserDialog = ({ onUserCreated }: InviteUserDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { roles } = useRoles();
  const { toast } = useToast();
  const { company } = useCurrentCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🐛 [DEBUG] Iniciando criação de usuário");
    console.log("🐛 [DEBUG] Dados do formulário:", { name, email, selectedRole, companyId: company?.id });
    
    if (!name || !email || !password || !selectedRole || !company?.id) {
      console.log("❌ [DEBUG] Erro: Campos obrigatórios faltando");
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      console.log("❌ [DEBUG] Erro: Senha muito curta");
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const roleData = roles.find(role => role.id === selectedRole);
      const webhookUrl = 'https://webhook.sparkassessoria.com/webhook/09705cd4-3e37-42f4-ac3d-57ac99ed8293';
      
      console.log("🔗 [DEBUG] URL do webhook:", webhookUrl);
      console.log("👤 [DEBUG] Dados do role encontrado:", roleData);
      
      const payload = {
        nome: name,
        email: email,
        senha: password,
        cargo: roleData?.name || '',
        role_id: selectedRole,
        companyId: company?.id,
        companyName: company?.name || '',
        create_with_password: true,
        timestamp: new Date().toISOString()
      };
      
      console.log("📦 [DEBUG] Payload a ser enviado:", payload);
      console.log("🚀 [DEBUG] Iniciando requisição para:", webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      console.log("✅ [DEBUG] Requisição concluída sem erro");
      console.log("📤 [DEBUG] Response object:", response);

      // Como estamos usando no-cors, não podemos verificar o status da resposta
      // Então assumimos sucesso se não houve erro na requisição
      toast({
        title: "Solicitação enviada!",
        description: `A solicitação para criar ${name} foi enviada. Verifique se o usuário foi criado no sistema.`
      });
      
      console.log("🧹 [DEBUG] Limpando formulário e fechando dialog");
      setName('');
      setEmail('');
      setPassword('');
      setSelectedRole('');
      setDialogOpen(false);
      onUserCreated?.();
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro capturado:', error);
      console.error('❌ [DEBUG] Tipo do erro:', error.constructor.name);
      console.error('❌ [DEBUG] Mensagem do erro:', error.message);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
      
      // Verificar se é erro de rede DNS
      if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error('🌐 [DEBUG] Erro DNS detectado - URL não pode ser resolvida');
        toast({
          title: "Erro de DNS",
          description: "A URL do webhook não pode ser encontrada. Verifique se o domínio está correto e acessível.",
          variant: "destructive"
        });
      } else if (error.message?.includes('fetch') || error.name === 'TypeError') {
        console.error('🔌 [DEBUG] Erro de conexão detectado');
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          variant: "destructive"
        });
      } else {
        console.error('❓ [DEBUG] Erro desconhecido');
        toast({
          title: "Erro ao criar usuário",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive"
        });
      }
    } finally {
      console.log("🏁 [DEBUG] Finalizando requisição, isSubmitting = false");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário diretamente no sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo do usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha do usuário (mín. 6 caracteres)"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Cargo *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} required>
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
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
