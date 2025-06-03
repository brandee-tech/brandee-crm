
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalLeads: number;
  totalContacts: number;
  totalTasks: number;
  recentLeads: any[];
  tasksByStatus: Record<string, number>;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalContacts: 0,
    totalTasks: 0,
    recentLeads: [],
    tasksByStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Buscar estatísticas gerais
      const [leadsResult, contactsResult, tasksResult] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }),
        supabase.from('contacts').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*', { count: 'exact' })
      ]);

      // Buscar leads recentes
      const { data: recentLeads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      // Buscar tarefas por status
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status');

      const tasksByStatus = tasks?.reduce((acc, task) => {
        const status = task.status || 'Pendente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        totalLeads: leadsResult.count || 0,
        totalContacts: contactsResult.count || 0,
        totalTasks: tasksResult.count || 0,
        recentLeads: recentLeads || [],
        tasksByStatus
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchDashboardData
  };
};
