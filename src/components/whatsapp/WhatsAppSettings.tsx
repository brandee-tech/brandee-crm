import { useState, useEffect } from 'react';
import { QrCode, Power, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppInstance } from '@/hooks/useWhatsAppInstance';

interface WhatsAppSettingsProps {
  companyId: string;
}

export const WhatsAppSettings = ({ companyId }: WhatsAppSettingsProps) => {
  const { instance, createInstance, getQRCode, logout } = useWhatsAppInstance(companyId);
  const [instanceName, setInstanceName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  useEffect(() => {
    if (instance?.status === 'pending' && !qrCode) {
      loadQRCode();
    }
  }, [instance]);

  const loadQRCode = async () => {
    if (!instance) return;

    setIsLoadingQR(true);
    try {
      const result = await getQRCode.mutateAsync(instance.instance_name);
      if (result.qrcode?.base64) {
        setQrCode(result.qrcode.base64);
      }
    } catch (error) {
      console.error('Erro ao carregar QR Code:', error);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) return;
    await createInstance.mutateAsync(instanceName);
  };

  const handleLogout = async () => {
    if (!instance) return;
    await logout.mutateAsync(instance.instance_name);
    setQrCode('');
  };

  const StatusBadge = () => {
    if (!instance) return null;

    const statusConfig = {
      connected: { icon: Check, color: 'text-green-600', label: 'Conectado' },
      disconnected: { icon: X, color: 'text-red-600', label: 'Desconectado' },
      pending: { icon: Loader2, color: 'text-yellow-600', label: 'Aguardando conexão' },
    };

    const config = statusConfig[instance.status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className={`w-4 h-4 ${instance.status === 'pending' ? 'animate-spin' : ''}`} />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  if (!instance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conectar WhatsApp</CardTitle>
          <CardDescription>
            Crie uma nova instância do WhatsApp para começar a enviar mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nome da Instância</Label>
            <Input
              id="instanceName"
              placeholder="Ex: empresa-whatsapp"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreateInstance}
            disabled={!instanceName.trim() || createInstance.isPending}
            className="w-full"
          >
            {createInstance.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando instância...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Criar Instância
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do WhatsApp</CardTitle>
        <CardDescription>
          Gerencie sua conexão com o WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Status da Conexão</Label>
          <StatusBadge />
        </div>

        {instance.phone_number && (
          <div className="space-y-2">
            <Label>Número Conectado</Label>
            <p className="text-sm font-mono">{instance.phone_number}</p>
          </div>
        )}

        {instance.status === 'pending' && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Escaneie o QR Code com o WhatsApp do seu celular para conectar
              </AlertDescription>
            </Alert>

            {isLoadingQR ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64 border border-border rounded-lg"
                />
                <Button onClick={loadQRCode} variant="outline">
                  Recarregar QR Code
                </Button>
              </div>
            ) : (
              <Button onClick={loadQRCode} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </Button>
            )}
          </div>
        )}

        {instance.status === 'connected' && (
          <Button
            onClick={handleLogout}
            variant="destructive"
            disabled={logout.isPending}
            className="w-full"
          >
            {logout.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Desconectar
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
