
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadSelector } from '@/components/LeadSelector';
import { useAppointments } from '@/hooks/useAppointments';
import { useLeads } from '@/hooks/useLeads';
import { useClosers } from '@/hooks/useClosers';
import { useAuth } from '@/hooks/useAuth';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { useToast } from '@/hooks/use-toast';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: number;
  lead_id: string | null;
  scheduled_by: string;
  assigned_to: string;
  status: string;
  created_at: string;
  updated_at: string;
  meeting_url?: string | null;
  leads?: {
    name: string;
  };
  assigned_closer?: {
    full_name: string | null;
    email: string | null;
  };
}

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const EditAppointmentDialog = ({ open, onOpenChange, appointment }: EditAppointmentDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [leadId, setLeadId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [status, setStatus] = useState('Agendado');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const { updateAppointment } = useAppointments();
  const { leads } = useLeads();
  const { closers } = useClosers();
  const { user } = useAuth();
  const { isTimeBlocked } = useScheduleBlocks();
  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title);
      setDescription(appointment.description || '');
      setDate(appointment.date);
      setTime(appointment.time);
      setDuration(appointment.duration);
      setLeadId(appointment.lead_id || '');
      setAssignedTo(appointment.assigned_to);
      setStatus(appointment.status);
      setMeetingUrl(appointment.meeting_url || '');
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !user) return;

    // Verificar se o horário está bloqueado (se mudou data/hora/responsável)
    if (date && time && assignedTo) {
      const isBlocked = isTimeBlocked(date, time, assignedTo, duration);
      if (isBlocked) {
        toast({
          title: "Horário Indisponível",
          description: "O horário selecionado está bloqueado para este usuário. Escolha outro horário.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    const updatedData = {
      title,
      description: description || null,
      date,
      time,
      duration,
      lead_id: leadId || null,
      assigned_to: assignedTo,
      status,
      meeting_url: meetingUrl || null,
      updated_at: new Date().toISOString()
    };

    const result = await updateAppointment(appointment.id, updatedData);
    
    if (result) {
      // Se status é "Reagendar", abrir dialog de reagendamento
      if (status === 'Reagendar') {
        setRescheduleDialogOpen(true);
      } else {
        onOpenChange(false);
        // Reset form
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setDuration(60);
        setLeadId('');
        setAssignedTo('');
        setStatus('Agendado');
        setMeetingUrl('');
      }
    }

    setLoading(false);
  };

  const statusOptions = [
    'Agendado',
    'Confirmado', 
    'Realizado',
    'Cancelado',
    'Reagendar',
    'No Show'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do agendamento (opcional)"
            />
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead">Lead</Label>
              <LeadSelector
                leads={leads}
                value={leadId || undefined}
                onValueChange={(value) => setLeadId(value || '')}
                placeholder="Selecione um lead (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Closer Responsável *</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um closer" />
                </SelectTrigger>
                <SelectContent>
                  {closers.map((closer) => (
                    <SelectItem key={closer.id} value={closer.id}>
                      {closer.full_name || closer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !assignedTo}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <RescheduleAppointmentDialog
        open={rescheduleDialogOpen}
        onOpenChange={(open) => {
          setRescheduleDialogOpen(open);
          if (!open) {
            onOpenChange(false);
            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setTime('');
            setDuration(60);
            setLeadId('');
            setAssignedTo('');
            setStatus('Agendado');
            setMeetingUrl('');
          }
        }}
        appointment={appointment}
      />
    </Dialog>
  );
};
