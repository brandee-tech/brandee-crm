
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointment';
import { AppointmentActions } from './AppointmentActions';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

export const AppointmentCard = ({ appointment, onEdit, onDelete }: AppointmentCardProps) => {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
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

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">{appointment.title}</h3>
        <AppointmentActions
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {appointment.description && (
        <p className="text-gray-600 text-sm mb-4">{appointment.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{formatDate(appointment.date)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{formatTime(appointment.time)} ({appointment.duration} min)</span>
        </div>

        {appointment.leads && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>{appointment.leads.name}</span>
          </div>
        )}

        {appointment.assigned_closer && (
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-gray-500" />
            <span>{appointment.assigned_closer.full_name || appointment.assigned_closer.email}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>
    </Card>
  );
};
