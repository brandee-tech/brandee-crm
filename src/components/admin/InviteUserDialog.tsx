import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail } from 'lucide-react';
import { useSaasRoles } from '@/hooks/useSaasRoles';
import { supabase } from '@/integrations/supabase/client';
const inviteSchema = z.object({
  email: z.string().email('Digite um email válido'),
  role_id: z.string().min(1, 'Selecione um cargo')
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
      role_id: ''
    }
  });
  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      // Gerar um UUID único para o perfil
      const userId = crypto.randomUUID();

      // Criar um perfil para o usuário convidado
      const {
        data: newProfile,
        error: profileError
      } = await supabase.from('profiles').insert({
        id: userId,
        email: data.email,
        company_id: companyId,
        role_id: data.role_id,
        full_name: data.email.split('@')[0] // Nome temporário baseado no email
      }).select().single();
      if (profileError) {
        if (profileError.message.includes('duplicate')) {
          throw new Error('Este email já está cadastrado no sistema');
        }
        throw profileError;
      }
      toast({
        title: "Usuário adicionado com sucesso!",
        description: `${data.email} foi adicionado à empresa ${companyName}`
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        title: "Erro ao adicionar usuário",
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
            <Mail className="w-5 h-5" />
            Convidar Usuário
          </DialogTitle>
          <DialogDescription>
            Adicionar um novo usuário para a empresa <strong>{companyName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email do usuário *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

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
                {loading ? 'Convidando...' : 'Convidar Usuário'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};