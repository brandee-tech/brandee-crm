
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadSelector } from '@/components/LeadSelector';
import { useAppointments } from '@/hooks/useAppointments';
import { useLeads } from '@/hooks/useLeads';
import { useClosers } from '@/hooks/useClosers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddAppointmentDialog = ({ open, onOpenChange }: AddAppointmentDialogProps) => {
  const { createAppointment } = useAppointments();
  const { leads } = useLeads();
  const { closers, loading: closersLoading } = useClosers();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    lead_id: '',
    assigned_to: '',
    status: 'Agendado',
    meeting_url: ''
  });

  // Auto-select current user as default assignee when closers are loaded
  useEffect(() => {
    if (!formData.assigned_to && user && closers.length > 0) {
      const currentUserInClosers = closers.find(closer => closer.id === user.id);
      if (currentUserInClosers) {
        setFormData(prev => ({ ...prev, assigned_to: user.id }));
      } else if (closers.length === 1) {
        // If only one option available, auto-select it
        setFormData(prev => ({ ...prev, assigned_to: closers[0].id }));
      }
    }
  }, [closers, user, formData.assigned_to]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (!formData.assigned_to) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um responsável para o agendamento",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        ...formData,
        scheduled_by: user.id,
        lead_id: formData.lead_id || null,
        assigned_to: formData.assigned_to,
        meeting_url: formData.meeting_url || null,
      };

      const created = await createAppointment(appointmentData);
      
      if (created) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: 60,
          lead_id: '',
          assigned_to: '',
          status: 'Agendado',
          meeting_url: ''
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Reunião de apresentação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalhes do agendamento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Link da Chamada</Label>
            <Input
              id="meetingUrl"
              type="url"
              value={formData.meeting_url}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_url: e.target.value }))}
              placeholder="https://meet.google.com/... ou https://zoom.us/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label>Lead</Label>
            <LeadSelector
              leads={leads}
              value={formData.lead_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value }))}
              placeholder="Selecione um lead"
            />
          </div>

          <div className="space-y-2">
            <Label>Responsável *</Label>
            {closersLoading ? (
              <div className="text-sm text-muted-foreground">Carregando usuários...</div>
            ) : closers.length === 0 ? (
              <div className="text-sm text-yellow-600">
                Nenhum usuário disponível para atribuir agendamentos. Verifique as permissões.
              </div>
            ) : (
              <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {closers.map((closer) => (
                    <SelectItem key={closer.id} value={closer.id}>
                      <div className="flex items-center gap-2">
                        <span>{closer.full_name || closer.email}</span>
                        {closer.roles && (
                          <span className="text-xs text-muted-foreground">
                            ({closer.roles.name})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Realizado">Realizado</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.assigned_to || isSubmitting || closersLoading}
            >
              {isSubmitting ? "Criando..." : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
