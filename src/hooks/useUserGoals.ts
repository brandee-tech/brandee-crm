import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserGoal {
  id: string;
  user_id: string;
  company_id: string;
  goal_type: 'vendas' | 'agendamentos' | 'conversoes' | 'receita';
  target_value: number;
  current_value: number;
  period: 'mensal' | 'trimestral' | 'anual';
  created_by: string;
  status: 'ativa' | 'pausada' | 'concluida';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const useUserGoals = () => {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          user:profiles!user_goals_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data as UserGoal[]) || []);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<UserGoal, 'id' | 'current_value' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;

      await fetchGoals();
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, goalData: Partial<UserGoal>) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update(goalData)
        .eq('id', id);

      if (error) throw error;

      await fetchGoals();
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchGoals();
      toast({
        title: "Sucesso",
        description: "Meta removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a meta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProgress = async () => {
    try {
      const { error } = await supabase.rpc('update_goal_progress');
      
      if (error) throw error;
      
      await fetchGoals();
    } catch (error) {
      console.error('Erro ao atualizar progresso das metas:', error);
    }
  };

  const getMyGoals = () => {
    return goals.filter(goal => goal.user_id === user?.id);
  };

  const getGoalsByUser = (userId: string) => {
    return goals.filter(goal => goal.user_id === userId);
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'ativa');
  };

  const getGoalProgress = (goal: UserGoal) => {
    return goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    getMyGoals,
    getGoalsByUser,
    getActiveGoals,
    getGoalProgress,
    refetch: fetchGoals
  };
};