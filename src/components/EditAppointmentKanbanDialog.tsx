
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';

interface EditAppointmentKanbanDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAppointmentKanbanDialog = ({ appointment, open, onOpenChange }: EditAppointmentKanbanDialogProps) => {
  const { updateAppointment } = useAppointments();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    status: 'Agendado',
    meetingUrl: ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title || '',
        description: appointment.description || '',
        date: appointment.date || '',
        time: appointment.time || '',
        duration: appointment.duration || 60,
        status: appointment.status || 'Agendado',
        meetingUrl: appointment.meeting_url || ''
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    const result = await updateAppointment(appointment.id, {
      title: formData.title,
      description: formData.description || null,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      status: formData.status,
      meeting_url: formData.meetingUrl || null
    });

    if (result && formData.status === 'Reagendar') {
      setRescheduleDialogOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              min="15"
              step="15"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Link da Chamada</Label>
            <Input
              id="meetingUrl"
              type="url"
              value={formData.meetingUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
              placeholder="https://meet.google.com/... ou https://zoom.us/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Agendado">Agendado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Realizado">Realizado</option>
              <option value="Reagendar">Reagendar</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {appointment && (
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Lead:</strong> {appointment.leads?.name || 'N/A'}</p>
              <p><strong>Closer:</strong> {appointment.assigned_closer?.full_name || appointment.assigned_closer?.email || 'N/A'}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <RescheduleAppointmentDialog
        open={rescheduleDialogOpen}
        onOpenChange={(open) => {
          setRescheduleDialogOpen(open);
          if (!open) {
            onOpenChange(false);
          }
        }}
        appointment={appointment}
      />
    </Dialog>
  );
};
