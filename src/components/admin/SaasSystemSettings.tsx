import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Settings, Shield, Plug, Package } from 'lucide-react';
export const SaasSystemSettings = () => {
  const {
    settings,
    loading,
    updateSetting,
    getSetting
  } = useSystemSettings();
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      await updateSetting(key, value);
    } finally {
      setIsSaving(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações globais da plataforma SaaS
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Planos
          </TabsTrigger>
          
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Básicas</CardTitle>
              <CardDescription>
                Configurações fundamentais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">Nome do Sistema</Label>
                <Input id="system-name" defaultValue={getSetting('system.name') || ''} onBlur={e => handleSaveSetting('system.name', e.target.value)} placeholder="Nome da plataforma" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <div className="text-sm text-gray-600">
                      Ativar para bloquear acesso ao sistema
                    </div>
                  </div>
                  <Switch checked={getSetting('system.maintenance_mode') || false} onCheckedChange={checked => handleSaveSetting('system.maintenance_mode', checked)} />
                </div>

                {getSetting('system.maintenance_mode') && <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                    <Textarea id="maintenance-message" defaultValue={getSetting('system.maintenance_message') || ''} onBlur={e => handleSaveSetting('system.maintenance_message', e.target.value)} placeholder="Mensagem exibida durante a manutenção" />
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Planos */}
        <TabsContent value="plans" className="space-y-4">
          {['basic', 'pro', 'enterprise'].map(plan => <Card key={plan}>
              <CardHeader>
                <CardTitle className="capitalize">Plano {plan === 'basic' ? 'Básico' : plan === 'pro' ? 'Pro' : 'Enterprise'}</CardTitle>
                <CardDescription>
                  Configure os limites para o plano {plan === 'basic' ? 'básico' : plan}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['users', 'leads_monthly', 'storage_gb'].map(limit => {
                const currentLimits = getSetting(`plans.${plan}.limits`) || {};
                return <div key={limit} className="space-y-2">
                        <Label htmlFor={`${plan}-${limit}`}>
                          {limit === 'users' ? 'Máx. Usuários' : limit === 'leads_monthly' ? 'Leads/Mês' : 'Storage (GB)'}
                        </Label>
                        <Input id={`${plan}-${limit}`} type="number" defaultValue={currentLimits[limit] || 0} onBlur={e => {
                    const newLimits = {
                      ...currentLimits,
                      [limit]: parseInt(e.target.value) || 0
                    };
                    handleSaveSetting(`plans.${plan}.limits`, newLimits);
                  }} />
                      </div>;
              })}
                </div>
              </CardContent>
            </Card>)}
        </TabsContent>

        {/* Configurações de Integrações */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks e APIs</CardTitle>
              <CardDescription>
                Configure URLs e integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook Principal</Label>
                <Input id="webhook-url" defaultValue={getSetting('integrations.webhook_url') || ''} onBlur={e => handleSaveSetting('integrations.webhook_url', e.target.value)} placeholder="https://api.example.com/webhook" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-server">Servidor SMTP</Label>
                <Input id="smtp-server" defaultValue={getSetting('integrations.smtp_server') || ''} onBlur={e => handleSaveSetting('integrations.smtp_server', e.target.value)} placeholder="smtp.gmail.com:587" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Segurança</CardTitle>
              <CardDescription>
                Configure as regras de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Tamanho Mínimo da Senha</Label>
                  <Input id="password-min-length" type="number" min="6" max="32" defaultValue={getSetting('security.password_min_length') || 8} onBlur={e => handleSaveSetting('security.password_min_length', parseInt(e.target.value))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Tempo de Sessão (horas)</Label>
                  <Input id="session-timeout" type="number" min="1" max="168" defaultValue={getSetting('security.session_timeout_hours') || 24} onBlur={e => handleSaveSetting('security.session_timeout_hours', parseInt(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};