
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { useMeetingsForCalendar } from '@/hooks/useMeetingsForCalendar';
import { ViewAppointmentDialog } from './ViewAppointmentDialog';
import { ViewMeetingDialog } from './ViewMeetingDialog';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointment';
import { Meeting } from '@/types/meeting';

export const CalendarView = () => {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { meetings, isLoading: meetingsLoading } = useMeetingsForCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [viewAppointmentDialogOpen, setViewAppointmentDialogOpen] = useState(false);
  const [viewMeetingDialogOpen, setViewMeetingDialogOpen] = useState(false);

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
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      case 'Realizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-purple-100 text-purple-800';
      case 'Em andamento':
        return 'bg-orange-100 text-orange-800';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewAppointmentDialogOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setViewMeetingDialogOpen(true);
  };

  const loading = appointmentsLoading || meetingsLoading;

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center">
        <div className="text-lg">Carregando calendário...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600 mt-1">Visualize todos os agendamentos e reuniões</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg md:text-xl font-semibold min-w-[150px] md:min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 md:gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Agendamentos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span>Reuniões</span>
        </div>
      </div>

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
                      onClick={() => handleAppointmentClick(appointment)}
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
                      onClick={() => handleMeetingClick(meeting)}
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

      {appointments.length === 0 && meetings.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento</h3>
          <p className="text-gray-500">Os agendamentos e reuniões aparecerão aqui quando forem criados</p>
        </div>
      )}

      <ViewAppointmentDialog
        open={viewAppointmentDialogOpen}
        onOpenChange={setViewAppointmentDialogOpen}
        appointment={selectedAppointment}
      />

      <ViewMeetingDialog
        open={viewMeetingDialogOpen}
        onOpenChange={setViewMeetingDialogOpen}
        meeting={selectedMeeting}
      />
    </div>
  );
};
