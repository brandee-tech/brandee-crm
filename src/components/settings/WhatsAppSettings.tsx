
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppSettings = () => {
  const { company, updateCompany, updating } = useCurrentCompany();
  const { toast } = useToast();
  
  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: false,
    phone: '',
    message: 'Olá! Preciso de ajuda.',
  });

  useEffect(() => {
    if (company) {
      setWhatsappConfig({
        enabled: company.whatsapp_enabled || false,
        phone: company.whatsapp_phone || '',
        message: company.whatsapp_message || 'Olá! Preciso de ajuda.',
      });
    }
  }, [company]);

  const handleSave = async () => {
    // Validar número de telefone se estiver habilitado
    if (whatsappConfig.enabled && !whatsappConfig.phone.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCompany({
        whatsapp_enabled: whatsappConfig.enabled,
        whatsapp_phone: whatsappConfig.phone,
        whatsapp_message: whatsappConfig.message,
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleConfigChange = (field: string, value: string | boolean) => {
    setWhatsappConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Suporte WhatsApp
        </CardTitle>
        <CardDescription>
          Configure o botão flutuante de suporte via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="whatsapp-enabled">Habilitar Suporte WhatsApp</Label>
            <p className="text-sm text-gray-500">
              Mostra um botão flutuante para os usuários entrarem em contato
            </p>
          </div>
          <Switch
            id="whatsapp-enabled"
            checked={whatsappConfig.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
        </div>

        {whatsappConfig.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp *</Label>
              <Input
                id="phone"
                value={whatsappConfig.phone}
                onChange={(e) => handleConfigChange('phone', e.target.value)}
                placeholder="5511999999999 (código do país + DDD + número)"
                required
              />
              <p className="text-xs text-gray-500">
                Digite apenas números: código do país + DDD + número (ex: 5511999999999)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Inicial</Label>
              <Textarea
                id="message"
                value={whatsappConfig.message}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Mensagem que será enviada automaticamente"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Esta mensagem será pré-preenchida no chat do WhatsApp
              </p>
            </div>

            {whatsappConfig.phone && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Preview:</strong> O botão aparecerá no canto inferior direito e redirecionará para:{' '}
                  <code className="bg-green-100 px-1 rounded">
                    https://wa.me/{whatsappConfig.phone.replace(/\D/g, '')}
                  </code>
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updating}>
            {updating ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
