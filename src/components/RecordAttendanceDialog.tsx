
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointmentRecords } from '@/hooks/useAppointmentRecords';
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog';
import { Appointment } from '@/types/appointment';

interface RecordAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const RecordAttendanceDialog = ({ open, onOpenChange, appointment }: RecordAttendanceDialogProps) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [summary, setSummary] = useState('');
  const [objections, setObjections] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [outcome, setOutcome] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const { createRecord } = useAppointmentRecords();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);

    try {
      await createRecord({
        appointment_id: appointment.id,
        start_time: startTime,
        end_time: endTime,
        summary,
        objections: objections || null,
        next_steps: nextSteps || null,
        outcome: outcome as any || null,
        notes: notes || null
      });

      // If outcome is "Reagendar", open reschedule dialog
      if (outcome === 'Reagendar') {
        setRescheduleDialogOpen(true);
      } else {
        onOpenChange(false);
      }
      // Reset form
      setStartTime('');
      setEndTime('');
      setSummary('');
      setObjections('');
      setNextSteps('');
      setOutcome('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error);
    }

    setLoading(false);
  };

  const outcomeOptions = [
    'Fechou',
    'Não Fechou',
    'Aguardando',
    'Reagendar',
    'No Show'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Atendimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Resumo dos Tópicos *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Descreva os principais tópicos abordados no atendimento"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objections">Objeções</Label>
            <Textarea
              id="objections"
              value={objections}
              onChange={(e) => setObjections(e.target.value)}
              placeholder="Descreva as objeções apresentadas pelo cliente"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextSteps">Próximos Passos</Label>
            <Textarea
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Defina os próximos passos do processo"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Resultado</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                {outcomeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações Adicionais</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais sobre o atendimento"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Registro'}
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
        appointment={appointment}
      />
    </Dialog>
  );
};
