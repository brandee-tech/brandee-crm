import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Key } from 'lucide-react';
import { useSaasRoles } from '@/hooks/useSaasRoles';
import { supabase } from '@/integrations/supabase/client';
const inviteSchema = z.object({
  email: z.string().email('Digite um email válido'),
  role_id: z.string().min(1, 'Selecione um cargo'),
  password: z.string().optional(),
  create_with_password: z.boolean().default(false)
}).refine((data) => {
  if (data.create_with_password && (!data.password || data.password.length < 6)) {
    return false;
  }
  return true;
}, {
  message: "Senha deve ter pelo menos 6 caracteres quando criar usuário diretamente",
  path: ["password"]
});
type InviteFormData = z.infer<typeof inviteSchema>;
interface InviteUserDialogProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}
export const InviteUserDialog = ({
  companyId,
  companyName,
  onSuccess
}: InviteUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    roles,
    loading: rolesLoading
  } = useSaasRoles(companyId);
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role_id: '',
      password: '',
      create_with_password: false
    }
  });

  const createWithPassword = form.watch('create_with_password');
  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: data.email,
          role_id: data.role_id,
          create_with_password: data.create_with_password,
          password: data.create_with_password ? data.password : undefined,
          send_email: !data.create_with_password
        }
      });

      if (error) {
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar solicitação');
      }

      toast({
        title: data.create_with_password ? "Usuário criado com sucesso!" : "Convite enviado com sucesso!",
        description: result.message
      });
      
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast({
        title: data.create_with_password ? "Erro ao criar usuário" : "Erro ao enviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {createWithPassword ? <Key className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            {createWithPassword ? 'Criar Usuário' : 'Convidar Usuário'}
          </DialogTitle>
          <DialogDescription>
            {createWithPassword 
              ? `Criar um novo usuário diretamente para a empresa ${companyName}`
              : `Enviar convite para um novo usuário da empresa ${companyName}`
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
              control={form.control} 
              name="create_with_password" 
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Criar usuário diretamente</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Criar usuário com senha ao invés de enviar convite por email
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email do usuário *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            {createWithPassword && (
              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha do usuário (mín. 6 caracteres)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            )}

            <FormField control={form.control} name="role_id" render={({
            field
          }) => <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? <SelectItem value="loading" disabled>
                          Carregando cargos...
                        </SelectItem> : roles.map(role => <SelectItem key={role.id} value={role.id}>
                            {role.name}
                            {role.is_system_role && ' (Sistema)'}
                          </SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>} />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (createWithPassword ? 'Criando...' : 'Enviando...') 
                  : (createWithPassword ? 'Criar Usuário' : 'Enviar Convite')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};