import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, Phone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useUserWhatsAppInstance } from '@/hooks/useUserWhatsAppInstance';
import QRCodeLib from 'qrcode';
import { toast } from 'sonner';

export const UserWhatsAppSettings = () => {
  const { instance, isLoading, createInstance, getQRCode, logout } = useUserWhatsAppInstance();
  const [instanceName, setInstanceName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }
    await createInstance.mutateAsync(instanceName);
  };

  const handleGetQRCode = async () => {
    if (!instance) return;
    
    setIsGeneratingQR(true);
    try {
      const result = await getQRCode.mutateAsync(instance.instance_name);
      
      if (result.code) {
        const qrDataUrl = await QRCodeLib.toDataURL(result.code);
        setQrCodeUrl(qrDataUrl);
      }
      
      if (result.pairingCode) {
        setPairingCode(result.pairingCode);
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleLogout = async () => {
    if (!instance) return;
    await logout.mutateAsync(instance.instance_name);
    setQrCodeUrl(null);
    setPairingCode(null);
  };

  useEffect(() => {
    if (instance?.status === 'connected') {
      setQrCodeUrl(null);
      setPairingCode(null);
    }
  }, [instance?.status]);

  const getStatusBadge = () => {
    if (!instance) return null;
    
    const statusConfig = {
      connected: { label: 'Conectado', icon: CheckCircle2, variant: 'default' as const, className: 'bg-green-500' },
      disconnected: { label: 'Desconectado', icon: XCircle, variant: 'secondary' as const, className: 'bg-red-500' },
      pending: { label: 'Pendente', icon: AlertCircle, variant: 'outline' as const, className: 'bg-yellow-500' },
    };

    const config = statusConfig[instance.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.className} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meu WhatsApp</CardTitle>
            <CardDescription>
              Conecte seu número de WhatsApp pessoal para atender clientes
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!instance ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="instanceName">Nome da Instância</Label>
              <Input
                id="instanceName"
                placeholder="Ex: Meu WhatsApp"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCreateInstance} 
              disabled={createInstance.isPending}
              className="w-full"
            >
              {createInstance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Instância
            </Button>
          </div>
        ) : instance.status === 'connected' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{instance.phone_number || 'Número não identificado'}</p>
                <p className="text-sm text-muted-foreground">Instância: {instance.instance_name}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              disabled={logout.isPending}
              variant="destructive"
              className="w-full"
            >
              {logout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">WhatsApp não conectado</p>
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code para conectar
                </p>
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                {pairingCode && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Código de emparelhamento:</p>
                    <p className="text-2xl font-mono font-bold">{pairingCode}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleGetQRCode} 
                disabled={isGeneratingQR}
                className="flex-1"
              >
                {isGeneratingQR && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <QrCode className="mr-2 h-4 w-4" />
                Gerar QR Code
              </Button>
              <Button 
                onClick={handleLogout} 
                disabled={logout.isPending}
                variant="outline"
              >
                {logout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Desconectar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
