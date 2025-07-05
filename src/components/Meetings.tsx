
import { useState } from 'react';
import { Plus, Calendar, Clock, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealtimeBadge } from '@/components/ui/realtime-badge';
import { useRealtimeMeetings } from '@/hooks/useRealtimeMeetings';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { MeetingDialog } from './MeetingDialog';
import { MeetingDetails } from './MeetingDetails';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Meetings = () => {
  const { meetings, loading, isUpdating } = useRealtimeMeetings();
  const { user } = useAuth();
  const { profiles } = useProfiles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const currentUserProfile = profiles.find(p => p.id === user?.id);
  
  // Log para debug
  console.log('Current user:', user?.id);
  console.log('Current user profile:', currentUserProfile);
  console.log('All profiles:', profiles);
  
  // Verificar se é admin através das permissões do cargo
  const userRole = currentUserProfile?.roles;
  const isAdmin = userRole?.permissions && 
    typeof userRole.permissions === 'object' && 
    (userRole.permissions as any).admin === true;
  
  console.log('User role:', userRole);
  console.log('Is admin:', isAdmin);
  console.log('Role permissions:', userRole?.permissions);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-500';
      case 'Em andamento':
        return 'bg-green-500';
      case 'Finalizada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (selectedMeetingId) {
    return (
      <MeetingDetails 
        meetingId={selectedMeetingId} 
        onBack={() => setSelectedMeetingId(null)} 
      />
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6 px-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reuniões</h1>
          <p className="text-gray-600">Gerencie suas reuniões, pautas e atas</p>
        </div>
        <div className="flex items-center gap-4">
          <RealtimeBadge isUpdating={isUpdating} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Reunião
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-lg">Carregando reuniões...</div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="px-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma reunião encontrada
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Comece criando sua primeira reunião.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Reunião
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 px-6">
          {meetings.map((meeting) => (
            <Card 
              key={meeting.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMeetingId(meeting.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meeting.title}
                      </h3>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-600 mb-3">{meeting.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(meeting.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time} ({meeting.duration}min)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MeetingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};
