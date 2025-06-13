
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Appointment } from '@/types/appointment';
import { Meeting } from '@/types/meeting';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  meetings: Meeting[];
  onAppointmentClick: (appointment: Appointment) => void;
  onMeetingClick: (meeting: Meeting) => void;
}

export const MonthView = ({
  currentDate,
  appointments,
  meetings,
  onAppointmentClick,
  onMeetingClick
}: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.date), date)
    );
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

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
    <Card className="p-3 md:p-6">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 py-2 text-xs md:text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1 md:gap-4">
        {daysInMonth.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const dayMeetings = getMeetingsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] md:min-h-[140px] p-1 md:p-2 border rounded-lg ${
                isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${
                isToday ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {/* Agendamentos */}
                {dayAppointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 border border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-2 h-2 md:w-3 md:h-3" />
                      <span className="font-medium text-[10px] md:text-xs">{formatTime(appointment.time)}</span>
                    </div>
                    
                    <div className="font-medium truncate text-[10px] md:text-xs" title={appointment.title}>
                      {appointment.title}
                    </div>
                    
                    {appointment.leads && (
                      <div className="flex items-center gap-1 text-gray-600 hidden md:flex">
                        <User className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="truncate text-[10px]" title={appointment.leads.name}>
                          {appointment.leads.name}
                        </span>
                      </div>
                    )}
                    
                    <Badge className={`${getAppointmentStatusColor(appointment.status)} text-[10px] mt-1 hidden md:inline-flex`}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}

                {/* Reuniões */}
                {dayMeetings.slice(0, 2).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="text-xs p-1 rounded bg-purple-100 text-purple-800 border border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => onMeetingClick(meeting)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-2 h-2 md:w-3 md:h-3" />
                      <span className="font-medium text-[10px] md:text-xs">{formatTime(meeting.time)}</span>
                    </div>
                    
                    <div className="font-medium truncate text-[10px] md:text-xs" title={meeting.title}>
                      <Users className="w-2 h-2 md:w-3 md:h-3 inline mr-1" />
                      {meeting.title}
                    </div>
                    
                    <Badge className={`${getMeetingStatusColor(meeting.status)} text-[10px] mt-1 hidden md:inline-flex`}>
                      {meeting.status}
                    </Badge>
                  </div>
                ))}

                {/* Indicador de mais eventos */}
                {(dayAppointments.length + dayMeetings.length) > 2 && (
                  <div className="text-[10px] text-gray-500 font-medium">
                    +{(dayAppointments.length + dayMeetings.length) - 2} mais
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
