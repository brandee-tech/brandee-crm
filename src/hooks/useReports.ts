
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const useReports = () => {
  const { user } = useAuth();

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<ReportData> => {
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Buscar todos os leads
      const { data: allLeads } = await supabase
        .from('leads')
        .select('*');

      // Buscar leads do mês atual e anterior para comparação
      const [currentMonthLeads, lastMonthLeads] = await Promise.all([
        supabase.from('leads').select('*').gte('created_at', currentMonth.toISOString()),
        supabase.from('leads').select('*')
          .gte('created_at', lastMonth.toISOString())
          .lte('created_at', lastMonthEnd.toISOString())
      ]);

      // Buscar tarefas e agendamentos dos últimos 6 meses
      const [tasksData, appointmentsData] = await Promise.all([
        supabase.from('tasks').select('*').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('appointments').select('*').gte('created_at', sixMonthsAgo.toISOString())
      ]);

      // Calcular vendas por mês (últimos 6 meses)
      const salesByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthLeads = allLeads?.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate >= monthDate && leadDate < nextMonth && lead.status === 'Quente';
        }) || [];

        return {
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          value: monthLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
          count: monthLeads.length
        };
      }).reverse();

      // Calcular pipeline por status
      const pipelineData = ['Frio', 'Morno', 'Quente'].map(status => {
        const statusLeads = allLeads?.filter(lead => lead.status === status) || [];
        return {
          status,
          value: statusLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
          count: statusLeads.length
        };
      });

      // Calcular métricas
      const totalLeads = allLeads?.length || 0;
      const qualifiedLeads = allLeads?.filter(lead => lead.status === 'Quente').length || 0;
      const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
      
      const leadsWithValue = allLeads?.filter(lead => lead.value && lead.value > 0) || [];
      const avgDealValue = leadsWithValue.length > 0 
        ? leadsWithValue.reduce((sum, lead) => sum + (lead.value || 0), 0) / leadsWithValue.length 
        : 0;

      const totalRevenue = allLeads?.reduce((sum, lead) => sum + (lead.value || 0), 0) || 0;

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
    enabled: !!user,
  });

  return {
    reportData,
    isLoading,
    error
  };
};
