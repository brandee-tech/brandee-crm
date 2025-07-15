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
  const isTimeBlocked = (date: string, time?: string, userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return false;

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
      if (block.block_type === 'full_day') return true;

      // Se é bloqueio de horário específico e não foi passado um horário, não está bloqueado
      if (!time || !block.start_time || !block.end_time) return false;

      // Verificar se o horário está no range do bloqueio
      const blockStartTime = block.start_time;
      const blockEndTime = block.end_time;
      
      return time >= blockStartTime && time <= blockEndTime;
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