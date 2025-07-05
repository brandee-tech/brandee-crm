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
      setLoading(true);
      
      // Verificar se o usuário tem company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        // Se não tem empresa, retornar dados vazios
        setStats({
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
        setLoading(false);
        return;
      }
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch current counts
      const [
        leadsResult,
        contactsResult,
        tasksResult,
        appointmentsResult,
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }),
        supabase.from('contacts').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*', { count: 'exact' }),
        supabase.from('appointments').select('*', { count: 'exact' }),
      ]);

      // Fetch data for current month comparison
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

      // Fetch data for last month comparison
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

      // Fetch recent leads
      const { data: recentLeads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch detailed data for statistics
      const { data: allLeads } = await supabase.from('leads').select('*');
      const { data: allTasks } = await supabase.from('tasks').select('status');
      const { data: allAppointments } = await supabase.from('appointments').select('status');

      // Calculate statistics by status
      const tasksByStatus = allTasks?.reduce((acc, task) => {
        const status = task.status || 'Pendente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const leadsByStatus = allLeads?.reduce((acc, lead) => {
        const status = lead.status || 'New';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const appointmentsByStatus = allAppointments?.reduce((acc, appointment) => {
        const status = appointment.status || 'Scheduled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Calculate pipeline value (total leads count as proxy)
      const totalPipelineValue = allLeads?.length || 0;

      // Calculate conversion rate
      const qualifiedLeads = allLeads?.filter(lead => 
        ['Quente', 'Hot', 'Qualified'].includes(lead.status)
      ).length || 0;
      const totalLeadsCount = allLeads?.length || 0;
      const conversionRate = totalLeadsCount > 0 ? (qualifiedLeads / totalLeadsCount) * 100 : 0;

      // Average deal value (placeholder)
      const avgDealValue = 0;

      // Calculate trends
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
        totalLeads: leadsResult.count || 0,
        totalContacts: contactsResult.count || 0,
        totalTasks: tasksResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
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