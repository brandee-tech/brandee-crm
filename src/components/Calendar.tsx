
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';
import { useMeetingsForCalendar } from '@/hooks/useMeetingsForCalendar';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { ViewAppointmentDialog } from './ViewAppointmentDialog';
import { ViewMeetingDialog } from './ViewMeetingDialog';
import { CalendarHeader } from './calendar/CalendarHeader';
import { DayView } from './calendar/DayView';
import { WeekView } from './calendar/WeekView';
import { MonthView } from './calendar/MonthView';
import { Appointment } from '@/types/appointment';
import { Meeting } from '@/types/meeting';

type ViewMode = 'day' | 'week' | 'month';

export const CalendarView = () => {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { meetings, isLoading: meetingsLoading } = useMeetingsForCalendar();
  const { scheduleBlocks, isLoading: blocksLoading } = useScheduleBlocks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [viewAppointmentDialogOpen, setViewAppointmentDialogOpen] = useState(false);
  const [viewMeetingDialogOpen, setViewMeetingDialogOpen] = useState(false);

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewAppointmentDialogOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setViewMeetingDialogOpen(true);
  };

  const loading = appointmentsLoading || meetingsLoading || blocksLoading;

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center">
        <div className="text-lg">Carregando calendário...</div>
      </div>
    );
  }

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            meetings={meetings}
            scheduleBlocks={scheduleBlocks}
            onAppointmentClick={handleAppointmentClick}
            onMeetingClick={handleMeetingClick}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            meetings={meetings}
            scheduleBlocks={scheduleBlocks}
            onAppointmentClick={handleAppointmentClick}
            onMeetingClick={handleMeetingClick}
          />
        );
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            meetings={meetings}
            scheduleBlocks={scheduleBlocks}
            onAppointmentClick={handleAppointmentClick}
            onMeetingClick={handleMeetingClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

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
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Horários Bloqueados</span>
        </div>
      </div>

      {renderCalendarView()}

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
