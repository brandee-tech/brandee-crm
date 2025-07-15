
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Users } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointment';
import { Meeting } from '@/types/meeting';

interface ScheduleBlock {
  id: string;
  user_id: string;
  company_id: string;
  block_type: 'time_slot' | 'full_day';
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_recurring: boolean;
  recurring_pattern: any;
  reason?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  meetings: Meeting[];
  scheduleBlocks: ScheduleBlock[];
  onAppointmentClick: (appointment: Appointment) => void;
  onMeetingClick: (meeting: Meeting) => void;
  onBlockClick: (block: any) => void;
  onDateDoubleClick: (date: Date) => void;
}

export const DayView = ({
  currentDate,
  appointments,
  meetings,
  scheduleBlocks,
  onAppointmentClick,
  onMeetingClick,
  onBlockClick,
  onDateDoubleClick
}: DayViewProps) => {
  const dayAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.date), currentDate)
  );

  const dayMeetings = meetings.filter(meeting => 
    isSameDay(new Date(meeting.date), currentDate)
  );

  const dayScheduleBlocks = scheduleBlocks.filter(block => 
    isSameDay(new Date(block.start_date), currentDate)
  );

  const allEvents = [
    ...dayAppointments.map(apt => ({ 
      id: apt.id, 
      data: apt, 
      type: 'appointment' as const, 
      time: apt.time 
    })),
    ...dayMeetings.map(meeting => ({ 
      id: meeting.id, 
      data: meeting, 
      type: 'meeting' as const, 
      time: meeting.time 
    })),
    ...dayScheduleBlocks.map(block => ({ 
      id: block.id, 
      data: block, 
      type: 'block' as const, 
      time: block.start_time || '00:00' 
    }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  const formatTime = (timeStr: string) => timeStr.slice(0, 5);

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800';
      case 'Confirmado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      case 'Realizado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada': return 'bg-purple-100 text-purple-800';
      case 'Em andamento': return 'bg-orange-100 text-orange-800';
      case 'Finalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="p-4 md:p-6 cursor-pointer" 
      onDoubleClick={() => onDateDoubleClick(currentDate)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <div className="text-sm text-gray-600">
          {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {allEvents.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento hoje</h3>
          <p className="text-gray-500">Duplo clique para bloquear horário</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((event) => {
            if (event.type === 'appointment') {
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => onAppointmentClick(event.data)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{event.data.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {formatTime(event.time)}
                        {event.data.duration && ` (${event.data.duration} min)`}
                      </p>
                      {event.data.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.data.description}</p>
                      )}
                    </div>
                    <Badge className={`${getAppointmentStatusColor(event.data.status)} text-white`}>
                      {event.data.status}
                    </Badge>
                  </div>
                </div>
              );
            } else if (event.type === 'meeting') {
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border-l-4 border-purple-500 bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                  onClick={() => onMeetingClick(event.data)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-purple-900">{event.data.title}</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        {formatTime(event.time)}
                        {event.data.duration && ` (${event.data.duration} min)`}
                      </p>
                      {event.data.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.data.description}</p>
                      )}
                    </div>
                    <Badge className={`${getMeetingStatusColor(event.data.status)} text-white`}>
                      {event.data.status}
                    </Badge>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                  onClick={() => onBlockClick(event.data)}
                  title={event.data.reason || 'Horário bloqueado'}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">🚫 Horário Bloqueado</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {event.data.block_type === 'full_day' ? 'Dia inteiro' : 
                         event.data.start_time && event.data.end_time ? 
                         `${formatTime(event.data.start_time)} - ${formatTime(event.data.end_time)}` : 
                         'Horário não especificado'}
                      </p>
                      {event.data.reason && (
                        <p className="text-sm text-gray-600 mt-1">{event.data.reason}</p>
                      )}
                    </div>
                    <Badge className="bg-red-500 text-white">
                      Bloqueado
                    </Badge>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </Card>
  );
};
