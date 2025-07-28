
import { useState } from 'react';
import { Plus, UserX, Crown, User, UserCheck, UserMinus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useMeetingParticipants } from '@/hooks/useMeetingParticipants';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';

interface MeetingParticipantsProps {
  meetingId: string;
}

export const MeetingParticipants = ({ meetingId }: MeetingParticipantsProps) => {
  const { participants, addParticipant, removeParticipant, updateParticipantRole, markAttendance } = useMeetingParticipants(meetingId);
  const { profiles } = useProfiles();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Filtrar apenas usuários que não são participantes ainda
  const availableUsers = profiles.filter(profile => 
    !participants.some(participant => participant.user_id === profile.id)
  );

  const handleAddParticipant = async () => {
    if (!selectedUserId) return;
    
    try {
      await addParticipant.mutateAsync({ userId: selectedUserId });
      setSelectedUserId('');
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    await removeParticipant.mutateAsync(participantId);
  };

  const handleRoleChange = async (participantId: string, role: 'organizer' | 'participant') => {
    await updateParticipantRole.mutateAsync({ participantId, role });
  };

  const handleAttendanceChange = async (participantId: string, attended: boolean) => {
    await markAttendance.mutateAsync({ participantId, attended });
  };

  const getRoleIcon = (role: string) => {
    return role === 'organizer' ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'organizer' ? 'default' : 'secondary';
  };

  const getAttendanceBadge = (attended: boolean | null) => {
    if (attended === null) {
      return <Badge variant="outline" className="text-gray-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
    if (attended) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><UserCheck className="w-3 h-3 mr-1" />Presente</Badge>;
    }
    return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300"><UserMinus className="w-3 h-3 mr-1" />Ausente</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Participantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de participantes */}
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {getRoleIcon(participant.role)}
                  <span className="font-medium truncate">
                    {participant.profiles?.full_name || participant.profiles?.email || 'Usuário'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(participant.role)} className="shrink-0">
                    {participant.role === 'organizer' ? 'Organizador' : 'Participante'}
                  </Badge>
                  {getAttendanceBadge(participant.attended)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Controles de presença */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant={participant.attended === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAttendanceChange(participant.id, true)}
                    className="px-2 flex-1 sm:flex-none"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="ml-1 sm:hidden">Presente</span>
                  </Button>
                  <Button 
                    variant={participant.attended === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleAttendanceChange(participant.id, false)}
                    className="px-2 flex-1 sm:flex-none"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span className="ml-1 sm:hidden">Ausente</span>
                  </Button>
                </div>

                {/* Seletor de papel */}
                <Select 
                  value={participant.role} 
                  onValueChange={(role: 'organizer' | 'participant') => 
                    handleRoleChange(participant.id, role)
                  }
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participante</SelectItem>
                    <SelectItem value="organizer">Organizador</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botão de remover */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <UserX className="w-4 h-4" />
                      <span className="ml-1 sm:hidden">Remover</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover participante</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover este participante da reunião?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveParticipant(participant.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Nenhum participante adicionado ainda
            </div>
          )}
        </div>

        {/* Adicionar novo participante */}
        {availableUsers.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddParticipant}
              disabled={!selectedUserId || addParticipant.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        )}

        {availableUsers.length === 0 && participants.length > 0 && (
          <div className="text-center py-2 text-sm text-gray-500">
            Todos os usuários da empresa já foram adicionados
          </div>
        )}
      </CardContent>
    </Card>
  );
};
