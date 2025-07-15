
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
}

export const DayView = ({
  currentDate,
  appointments,
  meetings,
  scheduleBlocks,
  onAppointmentClick,
  onMeetingClick
}: DayViewProps) => {
  const dayAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.date), currentDate)
  );

  const dayMeetings = meetings.filter(meeting => 
    isSameDay(new Date(meeting.date), currentDate)
  );

  const allEvents = [
    ...dayAppointments.map(apt => ({ ...apt, type: 'appointment' as const })),
    ...dayMeetings.map(meeting => ({ ...meeting, type: 'meeting' as const }))
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
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h3>
        <p className="text-sm text-gray-600">
          {allEvents.length} {allEvents.length === 1 ? 'evento' : 'eventos'} agendado{allEvents.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="space-y-3">
        {allEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento hoje</h3>
            <p className="text-gray-500">Você não tem eventos agendados para este dia</p>
          </div>
        ) : (
          allEvents.map((event) => (
            <div
              key={`${event.type}-${event.id}`}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                event.type === 'appointment' 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
              }`}
              onClick={() => {
                if (event.type === 'appointment') {
                  onAppointmentClick(event as Appointment);
                } else {
                  onMeetingClick(event as Meeting);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm">{formatTime(event.time)}</span>
                    {event.type === 'appointment' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                  
                  {event.type === 'appointment' && (event as Appointment).leads && (
                    <p className="text-sm text-gray-600 mb-2">
                      Cliente: {(event as Appointment).leads.name}
                    </p>
                  )}
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  )}
                </div>
                
                <Badge className={
                  event.type === 'appointment' 
                    ? getAppointmentStatusColor(event.status) 
                    : getMeetingStatusColor(event.status)
                }>
                  {event.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
