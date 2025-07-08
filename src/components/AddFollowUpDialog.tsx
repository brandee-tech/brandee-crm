
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFollowUps } from '@/hooks/useFollowUps';
import { Appointment } from '@/types/appointment';

interface AddFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  appointmentRecordId?: string | null;
}

export const AddFollowUpDialog = ({ open, onOpenChange, appointment, appointmentRecordId }: AddFollowUpDialogProps) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [channel, setChannel] = useState<string>('');
  const [messageSent, setMessageSent] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { createFollowUp, getNextSequenceNumber } = useFollowUps();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);

    try {
      const sequenceNumber = getNextSequenceNumber(appointment.id);
      
      await createFollowUp({
        appointment_id: appointment.id,
        appointment_record_id: appointmentRecordId || null,
        sequence_number: sequenceNumber,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        channel: channel as any,
        message_sent: messageSent || null,
        meeting_url: meetingUrl || null,
        response_received: null,
        response_date: null,
        result: null,
        notes: notes || null,
        completed: false,
        completed_at: null
      });

      onOpenChange(false);
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setChannel('');
      setMessageSent('');
      setMeetingUrl('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao criar follow-up:', error);
    }

    setLoading(false);
  };

  const channelOptions = [
    'Telefone',
    'WhatsApp',
    'Email',
    'Presencial',
    'VideoCall'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Follow-up</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Data Agendada *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Horário *</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Canal de Contato *</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o canal" />
              </SelectTrigger>
              <SelectContent>
                {channelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageSent">Mensagem a Enviar</Label>
            <Textarea
              id="messageSent"
              value={messageSent}
              onChange={(e) => setMessageSent(e.target.value)}
              placeholder="Mensagem que será enviada no follow-up"
              rows={3}
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

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre este follow-up"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !channel}>
              {loading ? 'Criando...' : 'Criar Follow-up'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
