
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Users } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
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

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  meetings: Meeting[];
  scheduleBlocks: ScheduleBlock[];
  onAppointmentClick: (appointment: Appointment) => void;
  onMeetingClick: (meeting: Meeting) => void;
  onBlockClick: (block: any) => void;
  onDateDoubleClick: (date: Date) => void;
}

export const WeekView = ({
  currentDate,
  appointments,
  meetings,
  scheduleBlocks,
  onAppointmentClick,
  onMeetingClick,
  onBlockClick,
  onDateDoubleClick
}: WeekViewProps) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (date: Date) => {
    const dayAppointments = appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
    const dayMeetings = meetings.filter(meeting => 
      isSameDay(new Date(meeting.date), date)
    );
    const dayScheduleBlocks = scheduleBlocks.filter(block => 
      isSameDay(new Date(block.start_date), date)
    );
    
    return [
      ...dayAppointments.map(apt => ({ ...apt, type: 'appointment' as const })),
      ...dayMeetings.map(meeting => ({ ...meeting, type: 'meeting' as const })),
      ...dayScheduleBlocks.map(block => ({ ...block, type: 'block' as const, time: block.start_time || '00:00' }))
    ].sort((a, b) => a.time.localeCompare(b.time));
  };

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

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <Card className="p-6">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[300px] cursor-pointer ${
                isDayToday ? 'bg-blue-50 border border-blue-200 rounded-lg p-2' : ''
              }`}
              onDoubleClick={() => onDateDoubleClick(day)}
            >
              <div className={`text-center pb-3 border-b mb-3 ${
                isDayToday ? 'border-blue-300' : 'border-gray-200'
              }`}>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-semibold ${
                  isDayToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-2">
                {dayEvents.slice(0, 3).map((event) => {
                  if (event.type === 'appointment') {
                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        className="p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow bg-blue-100 text-blue-800 border border-blue-200"
                        onClick={() => onAppointmentClick(event as Appointment)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{formatTime(event.time)}</span>
                        </div>
                        <div className="font-semibold truncate" title={event.title}>
                          <User className="w-3 h-3 inline mr-1" />
                          {event.title}
                        </div>
                        <Badge className={`${getAppointmentStatusColor(event.status)} text-xs mt-1`}>
                          {event.status}
                        </Badge>
                      </div>
                    );
                  } else if (event.type === 'meeting') {
                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        className="p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow bg-purple-100 text-purple-800 border border-purple-200"
                        onClick={() => onMeetingClick(event as Meeting)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{formatTime(event.time)}</span>
                        </div>
                        <div className="font-semibold truncate" title={event.title}>
                          <Users className="w-3 h-3 inline mr-1" />
                          {event.title}
                        </div>
                        <Badge className={`${getMeetingStatusColor(event.status)} text-xs mt-1`}>
                          {event.status}
                        </Badge>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        className="p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow bg-red-100 text-red-800 border border-red-200"
                        onClick={() => onBlockClick(event)}
                        title={event.reason || 'Horário bloqueado'}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            {event.block_type === 'full_day' ? 'Dia todo' : formatTime(event.time)}
                          </span>
                        </div>
                        <div className="font-semibold truncate">
                          🚫 Bloqueado
                        </div>
                        <Badge className="bg-red-500 text-white text-xs mt-1">
                          Bloqueado
                        </Badge>
                      </div>
                    );
                  }
                })}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
