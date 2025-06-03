
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, UserCheck, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/appointment';

interface ViewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const ViewAppointmentDialog = ({ open, onOpenChange, appointment }: ViewAppointmentDialogProps) => {
  if (!appointment) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{appointment.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {appointment.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Descrição</p>
                <p className="text-gray-600 text-sm">{appointment.description}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Data</p>
              <p className="text-gray-600 text-sm">{formatDate(appointment.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Horário</p>
              <p className="text-gray-600 text-sm">{formatTime(appointment.time)} ({appointment.duration} minutos)</p>
            </div>
          </div>

          {appointment.leads && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Lead</p>
                <p className="text-gray-600 text-sm">{appointment.leads.name}</p>
              </div>
            </div>
          )}

          {appointment.assigned_closer && (
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Closer Responsável</p>
                <p className="text-gray-600 text-sm">{appointment.assigned_closer.full_name || appointment.assigned_closer.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium text-gray-900">Status</p>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
