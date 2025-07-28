import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserMinus, Users } from 'lucide-react';
import { useMeetingParticipants } from '@/hooks/useMeetingParticipants';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecorderProps {
  meetingId: string;
}

export const AttendanceRecorder = ({ meetingId }: AttendanceRecorderProps) => {
  const { participants, markAttendance } = useMeetingParticipants(meetingId);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const handleMarkAllPresent = async () => {
    setIsRecording(true);
    try {
      const promises = participants
        .filter(p => p.attended === null)
        .map(p => markAttendance.mutateAsync({ participantId: p.id, attended: true }));
      
      await Promise.all(promises);
      
      toast({
        title: 'Sucesso',
        description: 'Todos os participantes foram marcados como presentes',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao marcar presenças',
        variant: 'destructive'
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handleClearAttendance = async () => {
    setIsRecording(true);
    try {
      const promises = participants.map(p => 
        markAttendance.mutateAsync({ participantId: p.id, attended: false })
      );
      
      await Promise.all(promises);
      
      toast({
        title: 'Sucesso',
        description: 'Lista de presença foi limpa',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao limpar presenças',
        variant: 'destructive'
      });
    } finally {
      setIsRecording(false);
    }
  };

  const presentCount = participants.filter(p => p.attended === true).length;
  const absentCount = participants.filter(p => p.attended === false).length;
  const pendingCount = participants.filter(p => p.attended === null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Controle de Presença
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-sm text-green-600">Presentes</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <div className="text-sm text-red-600">Ausentes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
        </div>

        {/* Ações em lote */}
        <div className="flex gap-2">
          <Button 
            onClick={handleMarkAllPresent}
            disabled={isRecording || pendingCount === 0}
            className="flex-1"
            variant="outline"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Marcar Todos Presentes
          </Button>
          
          <Button 
            onClick={handleClearAttendance}
            disabled={isRecording}
            variant="outline"
            className="flex-1"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Limpar Lista
          </Button>
        </div>

        {/* Taxa de presença */}
        {participants.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Taxa de presença: {Math.round((presentCount / participants.length) * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};