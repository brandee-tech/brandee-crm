
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFollowUps } from '@/hooks/useFollowUps';
import { useAppointments } from '@/hooks/useAppointments';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';
import { FollowUp } from '@/types/appointmentRecord';

interface CompleteFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUp | null;
}

export const CompleteFollowUpDialog = ({ open, onOpenChange, followUp }: CompleteFollowUpDialogProps) => {
  const [responseReceived, setResponseReceived] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [result, setResult] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [relatedAppointment, setRelatedAppointment] = useState(null);

  const { updateFollowUp } = useFollowUps();
  const { appointments } = useAppointments();

  useEffect(() => {
    if (followUp) {
      setResponseReceived(followUp.response_received || '');
      setResponseDate(followUp.response_date ? followUp.response_date.split('T')[0] : '');
      setResult(followUp.result || '');
      setNotes(followUp.notes || '');
      
      // Find related appointment for rescheduling
      const appointment = appointments.find(apt => apt.id === followUp.appointment_id);
      setRelatedAppointment(appointment || null);
    }
  }, [followUp, appointments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp) return;

    setLoading(true);

    try {
      await updateFollowUp(followUp.id, {
        response_received: responseReceived || null,
        response_date: responseDate ? new Date(responseDate).toISOString() : null,
        result: result as any || null,
        notes: notes || null,
        completed: true,
        completed_at: new Date().toISOString()
      });

      // If result is "Reagendar", open reschedule dialog
      if (result === 'Reagendar' && relatedAppointment) {
        setRescheduleDialogOpen(true);
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao completar follow-up:', error);
    }

    setLoading(false);
  };

  const resultOptions = [
    'Fechou',
    'Não Fechou',
    'Aguardando',
    'Sem Resposta',
    'Reagendar',
    'No Show'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Concluir Follow-up</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responseReceived">Resposta Recebida</Label>
            <Textarea
              id="responseReceived"
              value={responseReceived}
              onChange={(e) => setResponseReceived(e.target.value)}
              placeholder="Descreva a resposta recebida do cliente"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseDate">Data da Resposta</Label>
            <Input
              id="responseDate"
              type="date"
              value={responseDate}
              onChange={(e) => setResponseDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Resultado</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                {resultOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o resultado do follow-up"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Concluir Follow-up'}
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
          }
        }}
        appointment={relatedAppointment}
      />
    </Dialog>
  );
};
