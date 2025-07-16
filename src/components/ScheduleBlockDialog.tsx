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
import { Switch } from '@/components/ui/switch';
import { EnhancedDateTimePicker } from '@/components/ui/enhanced-date-time-picker';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { formatDateToLocal, parseDateFromLocal, formatTimeForInput } from '@/lib/date-utils';

interface ScheduleBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockToEdit?: any;
  selectedDate?: Date | null;
}

export const ScheduleBlockDialog = ({ open, onOpenChange, blockToEdit, selectedDate }: ScheduleBlockDialogProps) => {
  const { createBlock, updateBlock } = useScheduleBlocks();
  const { toast } = useToast();
  const { user } = useAuth();
  const { company } = useCurrentCompany();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    block_type: 'time_slot' as 'time_slot' | 'full_day',
    start_date: null as Date | null,
    end_date: null as Date | null,
    start_time: '',
    end_time: '',
    is_recurring: false,
    recurring_pattern: {},
    reason: ''
  });

  // Reset form when dialog opens/closes or when editing different block
  useEffect(() => {
    if (blockToEdit) {
      setFormData({
        block_type: blockToEdit.block_type || 'time_slot',
        start_date: blockToEdit.start_date ? parseDateFromLocal(blockToEdit.start_date) : null,
        end_date: blockToEdit.end_date ? parseDateFromLocal(blockToEdit.end_date) : null,
        start_time: formatTimeForInput(blockToEdit.start_time) || '',
        end_time: formatTimeForInput(blockToEdit.end_time) || '',
        is_recurring: blockToEdit.is_recurring || false,
        recurring_pattern: blockToEdit.recurring_pattern || {},
        reason: blockToEdit.reason || ''
      });
    } else {
      setFormData({
        block_type: 'time_slot',
        start_date: selectedDate || null,
        end_date: null,
        start_time: '',
        end_time: '',
        is_recurring: false,
        recurring_pattern: {},
        reason: ''
      });
    }
  }, [blockToEdit, open, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !company) {
      toast({
        title: "Erro",
        description: "Usuário ou empresa não encontrados",
        variant: "destructive"
      });
      return;
    }

    // Validações
    if (!formData.start_date) {
      toast({
        title: "Erro",
        description: "Data de início é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (formData.block_type === 'time_slot') {
      if (!formData.start_time || !formData.end_time) {
        toast({
          title: "Erro",
          description: "Horário de início e fim são obrigatórios para bloqueios de horário específico",
          variant: "destructive"
        });
        return;
      }

      if (formData.start_time >= formData.end_time) {
        toast({
          title: "Erro",
          description: "Horário de início deve ser anterior ao horário de fim",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const blockData = {
        user_id: user.id,
        company_id: company.id,
        block_type: formData.block_type,
        start_date: formData.start_date ? formatDateToLocal(formData.start_date) : '',
        end_date: formData.end_date ? formatDateToLocal(formData.end_date) : null,
        start_time: formData.block_type === 'time_slot' ? formData.start_time : null,
        end_time: formData.block_type === 'time_slot' ? formData.end_time : null,
        is_recurring: formData.is_recurring,
        recurring_pattern: formData.is_recurring ? formData.recurring_pattern : {},
        reason: formData.reason || null,
        created_by: user.id
      };

      if (blockToEdit) {
        await updateBlock.mutateAsync({ ...blockData, id: blockToEdit.id });
        toast({
          title: "Sucesso",
          description: "Bloqueio de horário atualizado com sucesso",
        });
      } else {
        await createBlock.mutateAsync(blockData);
        toast({
          title: "Sucesso",
          description: "Bloqueio de horário criado com sucesso",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar bloqueio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o bloqueio. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {blockToEdit ? 'Editar Bloqueio' : 'Novo Bloqueio de Horário'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Bloqueio</Label>
            <Select 
              value={formData.block_type} 
              onValueChange={(value: 'time_slot' | 'full_day') => setFormData(prev => ({ ...prev, block_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_slot">Horário Específico</SelectItem>
                <SelectItem value="full_day">Dia Inteiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <EnhancedDateTimePicker
                selected={formData.start_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                placeholder="Selecionar data de início"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <EnhancedDateTimePicker
                selected={formData.end_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                placeholder="Selecionar data de fim (opcional)"
                className="w-full"
              />
            </div>
          </div>

          {formData.block_type === 'time_slot' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Horário de Início *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Horário de Fim *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                💡 Dica: Use os botões de horário comum para seleção rápida
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                  <Button
                    key={`start-${time}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, start_time: time }))}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
            />
            <Label htmlFor="is_recurring">Bloqueio recorrente</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ex: Férias, treinamento, indisponibilidade..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : blockToEdit ? "Atualizar" : "Criar Bloqueio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};