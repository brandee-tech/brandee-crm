import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Phone, CheckCircle2, XCircle, AlertCircle, Power } from 'lucide-react';
import { useCompanyWhatsAppInstances } from '@/hooks/useCompanyWhatsAppInstances';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const CompanyWhatsAppInstances = () => {
  const { instances, isLoading, disconnectInstance } = useCompanyWhatsAppInstances();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { label: 'Conectado', icon: CheckCircle2, className: 'bg-green-500 text-white' },
      disconnected: { label: 'Desconectado', icon: XCircle, className: 'bg-red-500 text-white' },
      pending: { label: 'Pendente', icon: AlertCircle, className: 'bg-yellow-500 text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <CardTitle>Instâncias WhatsApp da Empresa</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as instâncias de WhatsApp conectadas pelos membros da equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!instances || instances.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma instância de WhatsApp conectada ainda
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Instância</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(instance.user?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {instance.user?.full_name || 'Usuário não identificado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{instance.instance_name}</TableCell>
                  <TableCell>
                    {instance.phone_number || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell className="text-right">
                    {instance.status === 'connected' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={disconnectInstance.isPending}
                          >
                            {disconnectInstance.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desconectar instância?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Você está prestes a desconectar a instância de WhatsApp de{' '}
                              <strong>{instance.user?.full_name}</strong>. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => disconnectInstance.mutate(instance.instance_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Desconectar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
