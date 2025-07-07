import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { ArrowLeft, Building2, Settings, MessageSquare, Users, BarChart3, Save } from 'lucide-react';
import { useAdminCompanies } from '@/hooks/useAdminCompanies';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminUserRoleManagement } from '@/components/admin/AdminUserRoleManagement';

// Import form components from the original dialog
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Globe, Phone, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';

const companySchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Digite uma URL válida').optional().or(z.literal('')),
  phone: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  logo_url: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  date_format: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  whatsapp_message: z.string().optional(),
  whatsapp_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  whatsapp_notifications: z.boolean().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface FullCompanyData {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  plan: string | null;
  status: string | null;
  logo_url: string | null;
  timezone: string | null;
  currency: string | null;
  date_format: string | null;
  whatsapp_phone: string | null;
  whatsapp_message: string | null;
  whatsapp_enabled: boolean | null;
  email_notifications: boolean | null;
  whatsapp_notifications: boolean | null;
  created_at: string;
  user_count?: number;
  leads_count?: number;
  appointments_count?: number;
}

export const CompanyEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCompany, uploadLogo, loading } = useAdminCompanies();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [company, setCompany] = useState<FullCompanyData | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      domain: '',
      industry: '',
      size: '',
      location: '',
      website: '',
      phone: '',
      plan: 'basic',
      status: 'Prospect',
      logo_url: '',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      date_format: 'DD/MM/YYYY',
      whatsapp_phone: '',
      whatsapp_message: 'Olá! Como podemos ajudar você?',
      whatsapp_enabled: false,
      email_notifications: true,
      whatsapp_notifications: false,
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      setLoadingCompany(true);
      try {
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Buscar contadores separadamente  
        const { count: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('company_id', id);

        const { count: leadsCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact' })
          .eq('company_id', id);

        const { count: appointmentsCount } = await supabase
          .from('appointments')
          .select('id', { count: 'exact' })
          .eq('company_id', id);
        
        setCompany({
          ...companyData,
          user_count: userCount || 0,
          leads_count: leadsCount || 0,
          appointments_count: appointmentsCount || 0
        });
      } catch (error) {
        console.error('Error fetching company:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa",
          variant: "destructive"
        });
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [id, toast]);

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        domain: company.domain || '',
        industry: company.industry || '',
        size: company.size || '',
        location: company.location || '',
        website: company.website || '',
        phone: company.phone || '',
        plan: company.plan || 'basic',
        status: company.status || 'Prospect',
        logo_url: company.logo_url || '',
        timezone: company.timezone || 'America/Sao_Paulo',
        currency: company.currency || 'BRL',
        date_format: company.date_format || 'DD/MM/YYYY',
        whatsapp_phone: company.whatsapp_phone || '',
        whatsapp_message: company.whatsapp_message || 'Olá! Como podemos ajudar você?',
        whatsapp_enabled: company.whatsapp_enabled || false,
        email_notifications: company.email_notifications ?? true,
        whatsapp_notifications: company.whatsapp_notifications || false,
      });
    }
  }, [company, form]);

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const logoUrl = await uploadLogo(file);
      if (logoUrl) {
        form.setValue('logo_url', logoUrl);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!company) return;

    const success = await updateCompany({
      id: company.id,
      ...data,
    });

    if (success) {
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });
      navigate('/admin?tab=companies');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativa':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string | null) => {
    switch (plan?.toLowerCase()) {
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Carregando empresa...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600 mb-4">A empresa que você está procurando não existe.</p>
          <Button onClick={() => navigate('/admin?tab=companies')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para empresas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin?tab=companies')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div className="text-sm text-gray-500">
                Admin &gt; Empresas &gt; {company.name}
              </div>
            </div>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      {/* Company Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={company.logo_url || ''} />
                <AvatarFallback className="text-lg">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.domain || 'Sem domínio definido'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(company.status)}>
                {company.status || 'Prospect'}
              </Badge>
              <Badge className={getPlanColor(company.plan)}>
                {company.plan || 'Basic'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários & Cargos
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados fundamentais da empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Logo Upload Section */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={form.watch('logo_url') || ''} />
                        <AvatarFallback>
                          <Building2 className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogoUpload}
                          disabled={isUploadingLogo}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingLogo ? 'Enviando...' : 'Alterar Logo'}
                        </Button>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG até 2MB
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Minha Empresa LTDA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domínio</FormLabel>
                            <FormControl>
                              <Input placeholder="empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="São Paulo, SP" className="pl-10" {...field} />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="(11) 99999-9999" className="pl-10" {...field} />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="https://www.empresa.com" className="pl-10" {...field} />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plano</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o plano" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Prospect">Prospect</SelectItem>
                                <SelectItem value="Ativa">Ativa</SelectItem>
                                <SelectItem value="Inativa">Inativa</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <AdminUserRoleManagement 
                  companyId={company.id} 
                  companyName={company.name}
                />
              </TabsContent>

              {/* Other tabs would be implemented here similarly */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>
                      Configurações técnicas e preferências da empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-500">
                      Configurações em desenvolvimento...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whatsapp">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações WhatsApp</CardTitle>
                    <CardDescription>
                      Configure a integração com WhatsApp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-500">
                      Configurações WhatsApp em desenvolvimento...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas da Empresa</CardTitle>
                    <CardDescription>
                      Métricas e dados de desempenho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{company.user_count || 0}</div>
                        <div className="text-sm text-gray-600">Usuários</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{company.leads_count || 0}</div>
                        <div className="text-sm text-gray-600">Leads</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{company.appointments_count || 0}</div>
                        <div className="text-sm text-gray-600">Agendamentos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
};
