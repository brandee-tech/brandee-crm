import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const {
    createCompany
  } = useCompanies();
  const {
    signUp
  } = useAuth();
  const {
    toast
  } = useToast();
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
      // Primeiro, criar o usuário
      const { error: signUpError } = await signUp(data.contactEmail, data.contactPassword, data.contactName);
      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // Aguardar um pouco para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar a empresa (que automaticamente associará o usuário atual como admin)
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

      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a empresa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">We CRM</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cadastre sua Empresa
            </h2>
            <p className="text-lg text-gray-600">
              Preencha os dados da sua empresa para começar a usar nossa plataforma
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Todas as informações necessárias para configurar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Dados da Empresa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
                    
                    <FormField control={form.control} name="name" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Nome da Empresa *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Minha Empresa LTDA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="industry" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Setor *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                          </FormItem>} />

                      <FormField control={form.control} name="size" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Tamanho da Empresa *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Número de funcionários" />
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
                          </FormItem>} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="revenue" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Receita Anual</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                          </FormItem>} />

                      <FormField control={form.control} name="location" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Localização *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo, SP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="website" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.suaempresa.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  {/* Dados do Contato */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Dados do Administrador</h3>
                    <p className="text-sm text-gray-600">Esta pessoa será o administrador da empresa no sistema</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="contactName" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="contactPosition" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Cargo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: CEO, Diretor de Vendas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="contactEmail" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="contactPassword" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Senha *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="contactPhone" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  {/* Observações */}
                  <FormField control={form.control} name="notes" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Conte-nos mais sobre suas necessidades ou objetivos..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Cadastrando...' : 'Cadastrar Empresa e Acessar Dashboard'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default CompanyRegistration;