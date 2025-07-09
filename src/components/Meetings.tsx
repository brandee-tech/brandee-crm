
import { useState } from 'react';
import { Plus, Calendar, Clock, Users, FileText, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { useRealtimeMeetings } from '@/hooks/useRealtimeMeetings';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { MeetingDialog } from './MeetingDialog';
import { MeetingDetails } from './MeetingDetails';
import { RescheduleMeetingDialog } from './RescheduleMeetingDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Meeting } from '@/types/meeting';

export const Meetings = () => {
  const { meetings, loading, isUpdating } = useRealtimeMeetings();
  const { deleteMeeting, updateMeeting } = useMeetings();
  const { user } = useAuth();
  const { profiles } = useProfiles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [meetingToReschedule, setMeetingToReschedule] = useState<Meeting | null>(null);

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
      case 'Cancelada':
        return 'bg-red-500';
      case 'Reagendada':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDeleteMeeting = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMeetingToDelete(meetingId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (meetingToDelete) {
      deleteMeeting.mutate(meetingToDelete);
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  const handleStatusChange = (meetingId: string, newStatus: 'Agendada' | 'Em andamento' | 'Finalizada' | 'Cancelada' | 'Reagendada', e: React.MouseEvent) => {
    e.stopPropagation();
    updateMeeting.mutate({ id: meetingId, status: newStatus });
  };

  const handleRescheduleMeeting = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setMeetingToReschedule(meeting);
    setRescheduleDialogOpen(true);
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
                     <div className="flex items-center gap-2">
                       {meeting.status === 'Cancelada' && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={(e) => handleRescheduleMeeting(meeting, e)}
                           className="text-orange-600 border-orange-600 hover:bg-orange-50"
                         >
                           <RotateCcw className="w-4 h-4 mr-1" />
                           Reagendar
                         </Button>
                       )}
                       <Button variant="outline" size="sm">
                         <FileText className="w-4 h-4 mr-1" />
                         Ver Detalhes
                       </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => handleStatusChange(meeting.id, 'Agendada', e)}
                            disabled={meeting.status === 'Agendada'}
                          >
                            Marcar como Agendada
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleStatusChange(meeting.id, 'Em andamento', e)}
                            disabled={meeting.status === 'Em andamento'}
                          >
                            Marcar como Em andamento
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleStatusChange(meeting.id, 'Finalizada', e)}
                            disabled={meeting.status === 'Finalizada'}
                          >
                            Marcar como Finalizada
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleStatusChange(meeting.id, 'Cancelada', e)}
                            disabled={meeting.status === 'Cancelada'}
                          >
                            Marcar como Cancelada
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleDeleteMeeting(meeting.id, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir reunião
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reunião</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {meetingToReschedule && (
        <RescheduleMeetingDialog
          meeting={meetingToReschedule}
          open={rescheduleDialogOpen}
          onOpenChange={(open) => {
            setRescheduleDialogOpen(open);
            if (!open) {
              setMeetingToReschedule(null);
            }
          }}
        />
      )}
    </div>
  );
};
