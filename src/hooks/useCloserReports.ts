import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface CloserReportData {
  closerId: string;
  closerName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  appointmentCompletionRate: number;
  avgDealValue: number;
  activeTasks: number;
  completedTasks: number;
  leadsByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; value: number }[];
  appointmentsByMonth: { month: string; count: number }[];
  goals: {
    vendas: { target: number; current: number; progress: number } | null;
    receita: { target: number; current: number; progress: number } | null;
    agendamentos: { target: number; current: number; progress: number } | null;
  };
}

export interface ClosersComparisonData {
  closers: Array<{
    id: string;
    name: string;
    leads: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    appointments: number;
  }>;
  totalMetrics: {
    totalLeads: number;
    totalConversions: number;
    totalRevenue: number;
    totalAppointments: number;
  };
}

export const useCloserReports = (closerId?: string, periodDays: number = 30) => {
  const { userInfo, loading: userLoading } = useCurrentUser();

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['closer-reports', closerId, periodDays, userInfo?.company_id],
    queryFn: async (): Promise<CloserReportData | null> => {
      if (!userInfo?.company_id || !closerId) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
      
      // Buscar dados do closer
      const { data: closerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', closerId)
        .single();

      if (!closerProfile) return null;

      // Buscar agendamentos do closer no período
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .eq('assigned_to', closerId)
        .gte('created_at', startDate.toISOString());

      // Extrair lead_ids únicos dos agendamentos
      const leadIdsFromAppointments = [...new Set(
        appointments?.map(apt => apt.lead_id).filter(Boolean) || []
      )];

      // Buscar leads baseado nos agendamentos (independente da data de criação)
      let leads: any[] = [];
      if (leadIdsFromAppointments.length > 0) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('company_id', userInfo.company_id)
          .in('id', leadIdsFromAppointments);
        leads = leadsData || [];
      }

      // Buscar tarefas do closer
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .eq('assigned_to', closerId)
        .gte('created_at', startDate.toISOString());

      // Buscar metas do closer
      const { data: goals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .eq('user_id', closerId)
        .eq('status', 'ativa');

      // Calcular métricas
      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'Vendido').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const totalRevenue = leads?.filter(lead => lead.status === 'Vendido')
        .reduce((sum, lead) => sum + (lead.revenue_generated || 0), 0) || 0;
      const avgDealValue = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;

      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(apt => apt.status === 'Completed').length || 0;
      const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

      const activeTasks = tasks?.filter(task => task.status !== 'Concluída').length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'Concluída').length || 0;

      // Leads por status
      const leadsByStatus = leads?.reduce((acc, lead) => {
        const status = lead.status || 'Sem status';
        const existing = acc.find(item => item.status === status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status, count: 1 });
        }
        return acc;
      }, [] as { status: string; count: number }[]) || [];

      // Receita por mês (últimos 6 meses)
      const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const nextMonth = new Date(monthDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthRevenue = leads?.filter(lead => {
          const leadDate = new Date(lead.updated_at);
          return lead.status === 'Vendido' && 
                 leadDate >= monthDate && 
                 leadDate < nextMonth;
        }).reduce((sum, lead) => sum + (lead.revenue_generated || 0), 0) || 0;

        return {
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          value: monthRevenue
        };
      }).reverse();

      // Agendamentos por mês
      const appointmentsByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const nextMonth = new Date(monthDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthAppointments = appointments?.filter(apt => {
          const aptDate = new Date(apt.created_at);
          return aptDate >= monthDate && aptDate < nextMonth;
        }).length || 0;

        return {
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          count: monthAppointments
        };
      }).reverse();

      // Processar metas
      const goalsData = {
        vendas: null as { target: number; current: number; progress: number } | null,
        receita: null as { target: number; current: number; progress: number } | null,
        agendamentos: null as { target: number; current: number; progress: number } | null,
      };

      goals?.forEach(goal => {
        const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
        goalsData[goal.goal_type as keyof typeof goalsData] = {
          target: goal.target_value,
          current: goal.current_value,
          progress
        };
      });

      return {
        closerId,
        closerName: closerProfile.full_name || 'Sem nome',
        totalLeads,
        convertedLeads,
        conversionRate,
        totalRevenue,
        totalAppointments,
        completedAppointments,
        appointmentCompletionRate,
        avgDealValue,
        activeTasks,
        completedTasks,
        leadsByStatus,
        revenueByMonth,
        appointmentsByMonth,
        goals: goalsData
      };
    },
    enabled: !!userInfo?.company_id && !!closerId && !userLoading,
  });

  return {
    reportData,
    isLoading: isLoading || userLoading,
    error
  };
};

export const useClosersComparison = (periodDays: number = 30) => {
  const { userInfo, loading: userLoading } = useCurrentUser();

  const { data: comparisonData, isLoading, error } = useQuery({
    queryKey: ['closers-comparison', periodDays, userInfo?.company_id],
    queryFn: async (): Promise<ClosersComparisonData | null> => {
      if (!userInfo?.company_id) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Buscar todos os closers da empresa
      const { data: closers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('company_id', userInfo.company_id);

      if (!closers) return null;

      // Buscar dados para cada closer
      const closersData = await Promise.all(
        closers.map(async (closer) => {
          // Agendamentos do closer no período
          const { data: appointments } = await supabase
            .from('appointments')
            .select('*')
            .eq('company_id', userInfo.company_id)
            .eq('assigned_to', closer.id)
            .gte('created_at', startDate.toISOString());

          // Extrair lead_ids únicos dos agendamentos
          const leadIdsFromAppointments = [...new Set(
            appointments?.map(apt => apt.lead_id).filter(Boolean) || []
          )];

          // Buscar leads baseado nos agendamentos
          let leads: any[] = [];
          if (leadIdsFromAppointments.length > 0) {
            const { data: leadsData } = await supabase
              .from('leads')
              .select('*')
              .eq('company_id', userInfo.company_id)
              .in('id', leadIdsFromAppointments);
            leads = leadsData || [];
          }

          const totalLeads = leads?.length || 0;
          const conversions = leads?.filter(lead => lead.status === 'Vendido').length || 0;
          const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;
          const revenue = leads?.filter(lead => lead.status === 'Vendido')
            .reduce((sum, lead) => sum + (lead.revenue_generated || 0), 0) || 0;
          const appointmentsCount = appointments?.length || 0;

          return {
            id: closer.id,
            name: closer.full_name || 'Sem nome',
            leads: totalLeads,
            conversions,
            conversionRate,
            revenue,
            appointments: appointmentsCount
          };
        })
      );

      // Filtrar apenas closers com atividade
      const activeClosers = closersData.filter(closer => 
        closer.leads > 0 || closer.appointments > 0
      );

      // Calcular métricas totais
      const totalMetrics = activeClosers.reduce(
        (acc, closer) => ({
          totalLeads: acc.totalLeads + closer.leads,
          totalConversions: acc.totalConversions + closer.conversions,
          totalRevenue: acc.totalRevenue + closer.revenue,
          totalAppointments: acc.totalAppointments + closer.appointments
        }),
        { totalLeads: 0, totalConversions: 0, totalRevenue: 0, totalAppointments: 0 }
      );

      return {
        closers: activeClosers,
        totalMetrics
      };
    },
    enabled: !!userInfo?.company_id && !userLoading,
  });

  return {
    comparisonData,
    isLoading: isLoading || userLoading,
    error
  };
};