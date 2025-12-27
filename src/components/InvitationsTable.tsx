
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvitations } from '@/hooks/useInvitations';
import { Trash2, Clock, CheckCircle, XCircle, Mail, Link2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { InviteUserDialog } from '@/components/InviteUserDialog';

export const InvitationsTable = () => {
  const { invitations, loading, deleteInvitation, resendInvitation } = useInvitations();

  const getStatusBadge = (invitation: any) => {
    // ... code omitted for brevity ...
  };

  // ... code omitted for brevity ...

  if (loading) {
    // ... code omitted for brevity ...
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Convites Enviados</CardTitle>
            <CardDescription>Nenhum convite foi enviado ainda</CardDescription>
          </div>
          <InviteUserDialog />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Convites Enviados</CardTitle>
          <CardDescription>Gerencie os convites pendentes e aceitos</CardDescription>
        </div>
        <InviteUserDialog />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {invitation.sent_via_email ? (
                      <Mail className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Link2 className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-medium">{invitation.email}</span>
                  </div>
                  {getStatusBadge(invitation)}
                  <Badge variant="outline" className="text-xs">
                    {invitation.sent_via_email ? 'Email' : 'Manual'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Cargo: {invitation.roles?.name}</span>
                  <span>
                    Enviado em: {format(new Date(invitation.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                  <span>
                    Expira em: {format(new Date(invitation.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>

              {!invitation.used_at && (
                <div className="flex items-center gap-2">
                  {invitation.sent_via_email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resendInvitation(invitation.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Reenviar email"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remover convite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
