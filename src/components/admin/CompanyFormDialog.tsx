
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Building2, Users, Calendar, MapPin, Globe, Phone, MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { useAdminCompanies } from '@/hooks/useAdminCompanies';
import { useToast } from '@/hooks/use-toast';
import { AdminUserRoleManagement } from './AdminUserRoleManagement';

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

interface CompanyData {
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
  logo_url?: string | null;
  timezone?: string | null;
  currency?: string | null;
  date_format?: string | null;
  whatsapp_phone?: string | null;
  whatsapp_message?: string | null;
  whatsapp_enabled?: boolean | null;
  email_notifications?: boolean | null;
  whatsapp_notifications?: boolean | null;
  created_at?: string;
  updated_at?: string;
  // Estatísticas da admin_companies_view
  user_count?: number;
  leads_count?: number;
  appointments_count?: number;
}

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: CompanyData | null;
  onSuccess: () => void;
}

export const CompanyFormDialog = ({ 
  open, 
  onOpenChange, 
  company, 
  onSuccess 
}: CompanyFormDialogProps) => {
  const { createCompany, updateCompany, uploadLogo, loading } = useAdminCompanies();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const isEditing = !!company;

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
    } else {
      form.reset({
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
      });
    }
  }, [company, form]);

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo (2MB)
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
    let success = false;
    
    if (isEditing && company) {
      success = await updateCompany({
        id: company.id,
        ...data,
      });
    } else {
      const result = await createCompany(data);
      success = !!result;
    }

    if (success) {
      form.reset();
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados da empresa' 
              : 'Preencha os dados para adicionar uma nova empresa'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className={`grid w-full ${isEditing ? 'grid-cols-5 min-w-[500px]' : 'grid-cols-3 min-w-[300px]'}`}>
                  <TabsTrigger value="basic" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Básico</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Configurações</span>
                    <span className="sm:hidden">Config</span>
                  </TabsTrigger>
                  <TabsTrigger value="whatsapp" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                    <span className="sm:hidden">WA</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Aba Básico */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </TabsContent>

              {/* Aba Configurações */}
              <TabsContent value="settings" className="space-y-4">
                {/* Logo da Empresa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Logo da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={form.watch('logo_url')} alt={form.watch('name')} />
                        <AvatarFallback className="text-lg">
                          {form.watch('name')?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogoUpload}
                          disabled={isUploadingLogo}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingLogo ? 'Enviando...' : 'Alterar Logo'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">PNG ou JPG, máx. 2MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações Regionais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações Regionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuso Horário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o fuso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                                <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                                <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                                <SelectItem value="America/Recife">Recife (UTC-3)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moeda</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a moeda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                                <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date_format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formato de Data</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Formato de data" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Notificação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notificações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email_notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificações por Email</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receber notificações importantes por email
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba WhatsApp */}
              <TabsContent value="whatsapp" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Configurações do WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="whatsapp_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativar WhatsApp Business</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Habilitar suporte via WhatsApp para clientes
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('whatsapp_enabled') && (
                      <>
                        <FormField
                          control={form.control}
                          name="whatsapp_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp_message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensagem de Boas-vindas</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Olá! Como podemos ajudar você?"
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Notificações via WhatsApp</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Receber notificações importantes via WhatsApp
                                </div>
                              </div>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Usuários & Cargos - Apenas para Edição */}
              {isEditing && company && (
                <TabsContent value="users" className="space-y-4">
                  <AdminUserRoleManagement companyId={company.id} companyName={company.name} />
                </TabsContent>
              )}

              {/* Aba Estatísticas - Apenas para Edição */}
              {isEditing && company && (
                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Usuários</p>
                            <p className="text-2xl font-bold">{company.user_count || 0}</p>
                          </div>
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Leads</p>
                            <p className="text-2xl font-bold">{company.leads_count || 0}</p>
                          </div>
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Agendamentos</p>
                            <p className="text-2xl font-bold">{company.appointments_count || 0}</p>
                          </div>
                          <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações de Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                          <p className="text-sm">
                            {company.created_at 
                              ? new Date(company.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                          <p className="text-sm">
                            {company.updated_at 
                              ? new Date(company.updated_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric', 
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-2">
                        <Badge variant={company.status === 'Ativa' ? 'default' : 'secondary'}>
                          {company.status}
                        </Badge>
                        <Badge variant="outline">{company.plan}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || isUploadingLogo}>
                {loading 
                  ? (isEditing ? 'Atualizando...' : 'Criando...') 
                  : (isEditing ? 'Atualizar Empresa' : 'Criar Empresa')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
