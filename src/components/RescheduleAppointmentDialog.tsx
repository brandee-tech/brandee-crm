import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const RescheduleAppointmentDialog = ({ open, onOpenChange, appointment }: RescheduleAppointmentDialogProps) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const { createAppointment, updateAppointment } = useAppointments();

  useEffect(() => {
    if (appointment && open) {
      // Reset form when dialog opens
      setNewDate('');
      setNewTime('');
      setReason('');
      setMeetingUrl('');
    }
  }, [appointment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !newDate || !newTime) return;

    setLoading(true);

    try {
      // Create new appointment
      const newAppointment = await createAppointment({
        title: appointment.title,
        description: appointment.description,
        date: newDate,
        time: newTime,
        duration: appointment.duration || 60,
        lead_id: appointment.lead_id,
        scheduled_by: appointment.scheduled_by,
        assigned_to: appointment.assigned_to,
        status: 'Agendado',
        rescheduled_from_id: appointment.id,
        reschedule_reason: reason || null,
        meeting_url: meetingUrl || null
      });

      if (newAppointment) {
        // Update original appointment status
        await updateAppointment(appointment.id, {
          status: 'Reagendado',
          updated_at: new Date().toISOString()
        });

        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao reagendar:', error);
    }

    setLoading(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reagendar Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Agendamento Original:</h4>
            <p className="font-medium">{appointment.title}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time?.slice(0, 5)}
            </p>
            {appointment.leads?.name && (
              <p className="text-sm text-muted-foreground">Lead: {appointment.leads.name}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">Nova Data *</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newTime">Novo Horário *</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Link da Chamada</Label>
              <Input
                id="meetingUrl"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/... ou https://zoom.us/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo do Reagendamento</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo do reagendamento (opcional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !newDate || !newTime}>
                {loading ? 'Reagendando...' : 'Reagendar Agendamento'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};