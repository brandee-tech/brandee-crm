import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { toast } from '@/hooks/use-toast';

export interface ScheduleBlock {
  id: string;
  user_id: string;
  company_id: string;
  block_type: 'time_slot' | 'full_day';
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_recurring: boolean;
  recurring_pattern: any;
  reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleBlockData {
  block_type: 'time_slot' | 'full_day';
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  is_recurring: boolean;
  recurring_pattern?: any;
  reason?: string;
}

export const useScheduleBlocks = () => {
  const { user } = useAuth();
  const { company: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: scheduleBlocks = [], isLoading } = useQuery({
    queryKey: ['schedule-blocks', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as ScheduleBlock[];
    },
    enabled: !!currentCompany?.id,
  });

  const createBlock = useMutation({
    mutationFn: async (blockData: CreateScheduleBlockData) => {
      if (!user?.id || !currentCompany?.id) {
        throw new Error('Usuário ou empresa não encontrados');
      }

      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert({
          ...blockData,
          user_id: user.id,
          company_id: currentCompany.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
      toast({
        title: 'Sucesso',
        description: 'Bloqueio de horário criado com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar bloqueio de horário',
        variant: 'destructive',
      });
      console.error('Erro ao criar bloqueio:', error);
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleBlock> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
      toast({
        title: 'Sucesso',
        description: 'Bloqueio de horário atualizado com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar bloqueio de horário',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar bloqueio:', error);
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-blocks'] });
      toast({
        title: 'Sucesso',
        description: 'Bloqueio de horário removido com sucesso',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover bloqueio de horário',
        variant: 'destructive',
      });
      console.error('Erro ao remover bloqueio:', error);
    },
  });

  // Função para verificar se um horário está bloqueado
  const isTimeBlocked = (date: string, time?: string, userId?: string, duration: number = 60) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return false;

    console.log('🔍 [DEBUG] isTimeBlocked:', { date, time, userId: targetUserId, duration, totalBlocks: scheduleBlocks.length });

    return scheduleBlocks.some(block => {
      // Verificar se é o usuário correto
      if (block.user_id !== targetUserId) return false;

      const blockStartDate = new Date(block.start_date);
      const checkDate = new Date(date);
      
      // Verificar se a data está no range do bloqueio
      const isInDateRange = block.end_date 
        ? checkDate >= blockStartDate && checkDate <= new Date(block.end_date)
        : checkDate.toDateString() === blockStartDate.toDateString();

      if (!isInDateRange) return false;

      // Se é bloqueio de dia inteiro, está bloqueado
      if (block.block_type === 'full_day') {
        console.log('🔴 [DEBUG] Blocked by full day block:', block.reason);
        return true;
      }

      // Se é bloqueio de horário específico e não foi passado um horário, não está bloqueado
      if (!time || !block.start_time || !block.end_time) return false;

      // Converter horários para minutos para facilitar comparação
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const appointmentStart = timeToMinutes(time);
      const appointmentEnd = appointmentStart + duration;
      const blockStart = timeToMinutes(block.start_time);
      const blockEnd = timeToMinutes(block.end_time);

      // Verificar se há sobreposição entre o agendamento e o bloqueio
      const hasOverlap = appointmentStart < blockEnd && appointmentEnd > blockStart;
      
      if (hasOverlap) {
        console.log('🔴 [DEBUG] Blocked by time overlap:', {
          appointmentWindow: `${time} - ${appointmentEnd/60 >> 0}:${(appointmentEnd%60).toString().padStart(2, '0')}`,
          blockWindow: `${block.start_time} - ${block.end_time}`,
          reason: block.reason
        });
      }

      return hasOverlap;
    });
  };

  return {
    scheduleBlocks,
    isLoading,
    createBlock,
    updateBlock,
    deleteBlock,
    isTimeBlocked,
  };
};