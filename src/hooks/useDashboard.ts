
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalLeads: number;
  totalContacts: number;
  totalTasks: number;
  totalAppointments: number;
  recentLeads: any[];
  tasksByStatus: Record<string, number>;
  leadsByStatus: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  totalPipelineValue: number;
  trendsData: {
    leadsChange: number;
    contactsChange: number;
    tasksChange: number;
    appointmentsChange: number;
  };
  conversionRate: number;
  avgDealValue: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalContacts: 0,
    totalTasks: 0,
    totalAppointments: 0,
    recentLeads: [],
    tasksByStatus: {},
    leadsByStatus: {},
    appointmentsByStatus: {},
    totalPipelineValue: 0,
    trendsData: {
      leadsChange: 0,
      contactsChange: 0,
      tasksChange: 0,
      appointmentsChange: 0,
    },
    conversionRate: 0,
    avgDealValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Buscar dados do mês atual
      const [
        currentLeadsResult,
        currentContactsResult,
        currentTasksResult,
        currentAppointmentsResult,
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('contacts').select('*', { count: 'exact' }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('tasks').select('*', { count: 'exact' }).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('appointments').select('*', { count: 'exact' }).gte('created_at', currentMonthStart.toISOString()),
      ]);

      // Buscar dados do mês anterior para comparação
      const [
        lastLeadsResult,
        lastContactsResult,
        lastTasksResult,
        lastAppointmentsResult,
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' })
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('contacts').select('*', { count: 'exact' })
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('tasks').select('*', { count: 'exact' })
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('appointments').select('*', { count: 'exact' })
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
      ]);

      // Buscar leads recentes
      const { data: recentLeads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar todos os leads para calcular estatísticas
      const { data: allLeads } = await supabase
        .from('leads')
        .select('*');

      // Buscar todas as tarefas para estatísticas
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status');

      // Buscar todos os agendamentos para estatísticas
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('status');

      // Calcular estatísticas por status
      const tasksByStatus = allTasks?.reduce((acc, task) => {
        const status = task.status || 'Pendente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const leadsByStatus = allLeads?.reduce((acc, lead) => {
        const status = lead.status || 'Frio';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const appointmentsByStatus = allAppointments?.reduce((acc, appointment) => {
        const status = appointment.status || 'Agendado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Como removemos o campo valor, o pipeline agora é baseado apenas na quantidade
      const totalPipelineValue = allLeads?.length || 0;

      // Calcular taxa de conversão (leads qualificados vs total)
      const qualifiedLeads = allLeads?.filter(lead => lead.status === 'Quente').length || 0;
      const totalLeadsCount = allLeads?.length || 0;
      const conversionRate = totalLeadsCount > 0 ? (qualifiedLeads / totalLeadsCount) * 100 : 0;

      // Como não temos mais valores monetários, definimos o ticket médio como 0
      const avgDealValue = 0;

      // Calcular mudanças percentuais
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const trendsData = {
        leadsChange: calculateChange(currentLeadsResult.count || 0, lastLeadsResult.count || 0),
        contactsChange: calculateChange(currentContactsResult.count || 0, lastContactsResult.count || 0),
        tasksChange: calculateChange(currentTasksResult.count || 0, lastTasksResult.count || 0),
        appointmentsChange: calculateChange(currentAppointmentsResult.count || 0, lastAppointmentsResult.count || 0),
      };

      setStats({
        totalLeads: totalLeadsCount,
        totalContacts: currentContactsResult.count || 0,
        totalTasks: currentTasksResult.count || 0,
        totalAppointments: currentAppointmentsResult.count || 0,
        recentLeads: recentLeads || [],
        tasksByStatus,
        leadsByStatus,
        appointmentsByStatus,
        totalPipelineValue,
        trendsData,
        conversionRate,
        avgDealValue,
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
