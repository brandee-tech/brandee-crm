
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface ReportData {
  salesByMonth: { month: string; value: number; count: number }[];
  pipelineData: { status: string; value: number; count: number }[];
  conversionRate: number;
  avgDealValue: number;
  qualifiedLeads: number;
  avgSalesCycle: number;
  totalRevenue: number;
  trendsData: {
    salesChange: number;
    leadsChange: number;
    conversionChange: number;
  };
  leadsBySource: { source: string; count: number }[];
  activitiesByMonth: { month: string; tasks: number; appointments: number }[];
}

export const useReports = (closerId?: string) => {
  const { userInfo, loading: userLoading } = useCurrentUser();

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['reports', userInfo?.company_id, closerId],
    queryFn: async (): Promise<ReportData> => {
      if (!userInfo?.company_id) throw new Error('Usuário sem empresa');

      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Buscar todos os leads da empresa (filtrado por closer se fornecido)
      let allLeadsQuery = supabase
        .from('leads')
        .select('*')
        .eq('company_id', userInfo.company_id);

      if (closerId) {
        allLeadsQuery = allLeadsQuery.eq('assigned_to', closerId);
      }

      const { data: allLeads } = await allLeadsQuery;

      // Buscar leads do mês atual e anterior para comparação
      let currentMonthQuery = supabase.from('leads').select('*')
        .eq('company_id', userInfo.company_id)
        .gte('created_at', currentMonth.toISOString());
      let lastMonthQuery = supabase.from('leads').select('*')
        .eq('company_id', userInfo.company_id)
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      if (closerId) {
        currentMonthQuery = currentMonthQuery.eq('assigned_to', closerId);
        lastMonthQuery = lastMonthQuery.eq('assigned_to', closerId);
      }

      const [currentMonthLeads, lastMonthLeads] = await Promise.all([
        currentMonthQuery,
        lastMonthQuery
      ]);

      // Buscar tarefas e agendamentos dos últimos 6 meses da empresa
      let tasksQuery = supabase.from('tasks').select('*')
        .eq('company_id', userInfo.company_id)
        .gte('created_at', sixMonthsAgo.toISOString());
      let appointmentsQuery = supabase.from('appointments').select('*')
        .eq('company_id', userInfo.company_id)
        .gte('created_at', sixMonthsAgo.toISOString());

      if (closerId) {
        tasksQuery = tasksQuery.eq('assigned_to', closerId);
        appointmentsQuery = appointmentsQuery.eq('assigned_to', closerId);
      }

      const [tasksData, appointmentsData] = await Promise.all([
        tasksQuery,
        appointmentsQuery
      ]);

      // Calcular vendas por mês (últimos 6 meses) - agora baseado apenas na quantidade
      const salesByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthLeads = allLeads?.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate >= monthDate && leadDate < nextMonth && lead.status === 'Quente';
        }) || [];

        return {
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          value: monthLeads.length, // Agora representa quantidade em vez de valor monetário
          count: monthLeads.length
        };
      }).reverse();

      // Calcular pipeline por status
      const pipelineData = ['Frio', 'Morno', 'Quente'].map(status => {
        const statusLeads = allLeads?.filter(lead => lead.status === status) || [];
        return {
          status,
          value: statusLeads.length, // Agora representa quantidade
          count: statusLeads.length
        };
      });

      // Calcular métricas
      const totalLeads = allLeads?.length || 0;
      const soldLeads = allLeads?.filter(lead => lead.status === 'Vendido') || [];
      const qualifiedLeads = soldLeads.length; // Agora baseado em vendas reais
      const conversionRate = totalLeads > 0 ? (soldLeads.length / totalLeads) * 100 : 0;
      
      // Calcular receita total dos leads vendidos
      const totalRevenue = soldLeads.reduce((sum, lead) => sum + (lead.revenue_generated || 0), 0);
      const avgDealValue = soldLeads.length > 0 ? totalRevenue / soldLeads.length : 0;

      // Calcular ciclo de vendas médio (diferença entre criação e última atualização dos leads quentes)
      const hotLeads = allLeads?.filter(lead => lead.status === 'Quente') || [];
      const avgSalesCycle = hotLeads.length > 0 
        ? hotLeads.reduce((sum, lead) => {
            const created = new Date(lead.created_at);
            const updated = new Date(lead.updated_at);
            return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / hotLeads.length
        : 0;

      // Calcular mudanças percentuais
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const currentSales = currentMonthLeads.data?.filter(lead => lead.status === 'Quente').length || 0;
      const lastSales = lastMonthLeads.data?.filter(lead => lead.status === 'Quente').length || 0;
      const currentLeadsCount = currentMonthLeads.data?.length || 0;
      const lastLeadsCount = lastMonthLeads.data?.length || 0;
      
      const currentConversion = currentLeadsCount > 0 ? (currentSales / currentLeadsCount) * 100 : 0;
      const lastConversion = lastLeadsCount > 0 ? (lastSales / lastLeadsCount) * 100 : 0;

      const trendsData = {
        salesChange: calculateChange(currentSales, lastSales),
        leadsChange: calculateChange(currentLeadsCount, lastLeadsCount),
        conversionChange: calculateChange(currentConversion, lastConversion)
      };

      // Leads por fonte
      const leadsBySource = Array.from(
        allLeads?.reduce((acc, lead) => {
          const source = lead.source || 'Não informado';
          acc.set(source, (acc.get(source) || 0) + 1);
          return acc;
        }, new Map()) || new Map()
      ).map(([source, count]) => ({ source, count }));

      // Atividades por mês
      const activitiesByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthTasks = tasksData.data?.filter(task => {
          const taskDate = new Date(task.created_at);
          return taskDate >= monthDate && taskDate < nextMonth;
        }).length || 0;

        const monthAppointments = appointmentsData.data?.filter(appointment => {
          const appointmentDate = new Date(appointment.created_at);
          return appointmentDate >= monthDate && appointmentDate < nextMonth;
        }).length || 0;

        return {
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          tasks: monthTasks,
          appointments: monthAppointments
        };
      }).reverse();

      return {
        salesByMonth,
        pipelineData,
        conversionRate,
        avgDealValue,
        qualifiedLeads,
        avgSalesCycle,
        totalRevenue,
        trendsData,
        leadsBySource,
        activitiesByMonth
      };
    },
    enabled: !!userInfo?.company_id && !userLoading,
  });

  return {
    reportData,
    isLoading: isLoading || userLoading,
    error
  };
};
