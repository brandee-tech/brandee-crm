
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const companySchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  industry: z.string().min(1, 'Selecione um setor'),
  size: z.string().min(1, 'Selecione o tamanho da empresa'),
  revenue: z.string().optional(),
  location: z.string().min(1, 'Localização é obrigatória'),
  website: z.string().url('Digite uma URL válida').optional().or(z.literal('')),
  contactName: z.string().min(2, 'Nome do contato é obrigatório'),
  contactEmail: z.string().email('Email inválido'),
  contactPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  contactPhone: z.string().min(1, 'Telefone é obrigatório'),
  contactPosition: z.string().min(1, 'Cargo é obrigatório'),
  notes: z.string().optional()
});

type CompanyFormData = z.infer<typeof companySchema>;

export const CompanyRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { createCompany } = useCompanies();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      industry: '',
      size: '',
      revenue: '',
      location: '',
      website: '',
      contactName: '',
      contactEmail: '',
      contactPassword: '',
      contactPhone: '',
      contactPosition: '',
      notes: ''
    }
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const { error: signUpError } = await signUp(data.contactEmail, data.contactPassword, data.contactName);
      if (signUpError) {
        throw new Error(signUpError.message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      await createCompany({
        name: data.name,
        industry: data.industry,
        size: data.size,
        location: data.location,
        website: data.website || null,
        phone: data.contactPhone || null,
        domain: null,
        plan: 'basic',
        status: 'Ativo'
      });

      toast({
        title: "Sucesso!",
        description: "Empresa e usuário cadastrados com sucesso. Redirecionando para o dashboard...",
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao cadastrar empresa:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar a empresa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "h-12 bg-[#F4F4F6] border-none focus-visible:ring-1 focus-visible:ring-primary/20";
  const labelClasses = "text-sm font-semibold text-slate-900";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[600px] space-y-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              We CRM
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Cadastre sua Empresa</h1>
          <p className="text-slate-500">Preencha os dados abaixo para configurar sua conta profissional.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
            {/* Informações da Empresa */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Informações da Empresa</h3>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClasses}>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Minha Empresa LTDA" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="industry" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Setor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="agronegocio">Agronegócio</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="size" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Tamanho *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder="Funcionários" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 funcionários</SelectItem>
                        <SelectItem value="11-50">11-50 funcionários</SelectItem>
                        <SelectItem value="51-200">51-200 funcionários</SelectItem>
                        <SelectItem value="201-500">201-500 funcionários</SelectItem>
                        <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                        <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="revenue" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Receita Anual</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder="Selecione a receita" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ate-100k">Até R$ 100 mil</SelectItem>
                        <SelectItem value="100k-500k">R$ 100 mil - R$ 500 mil</SelectItem>
                        <SelectItem value="500k-1m">R$ 500 mil - R$ 1 milhão</SelectItem>
                        <SelectItem value="1m-5m">R$ 1 milhão - R$ 5 milhões</SelectItem>
                        <SelectItem value="5m-10m">R$ 5 milhões - R$ 10 milhões</SelectItem>
                        <SelectItem value="10m+">Mais de R$ 10 milhões</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Localização *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo, SP" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClasses}>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.suaempresa.com.br" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Dados do Administrador */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Dados do Administrador</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contactPosition" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Cargo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CEO, Diretor" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>E-mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} className={inputClasses} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contactPassword" render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClasses}>Senha *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                          className={`${inputClasses} pr-10`}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClasses}>Telefone *</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} className={inputClasses} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Observações */}
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="space-y-2 pt-4">
                <FormLabel className={labelClasses}>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Conte-nos mais sobre seu negócio..."
                    className="min-h-[120px] bg-[#F4F4F6] border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="pt-6 space-y-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 uppercase tracking-wide transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Empresa e Acessar Dashboard'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Já possui uma conta? Entre aqui
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompanyRegistration;