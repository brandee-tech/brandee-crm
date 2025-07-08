import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalLeads: number;
  totalContacts: number;
  totalTasks: number;
  totalAppointments: number;
  recentLeads: any[];
  upcomingAppointments: any[];
  recentActivities: any[];
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
    upcomingAppointments: [],
    recentActivities: [],
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
          upcomingAppointments: [],
          recentActivities: [],
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

      // Fetch upcoming appointments (próximos 7 dias)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (name, phone),
          assigned_closer:profiles!appointments_assigned_to_fkey (full_name)
        `)
        .gte('date', tomorrow.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(5);

      // Fetch recent activities (últimos leads, agendamentos e tarefas criados)
      const recentActivities = [];
      
      // Adicionar leads recentes
      if (recentLeads) {
        recentActivities.push(...recentLeads.slice(0, 3).map(lead => ({
          type: 'lead',
          title: `Novo lead: ${lead.name}`,
          description: `Lead criado por ${lead.created_by}`,
          time: lead.created_at,
          icon: 'user'
        })));
      }

      // Adicionar agendamentos recentes (últimos 3 dias)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3);
      
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (name),
          assigned_closer:profiles!appointments_assigned_to_fkey (full_name)
        `)
        .gte('created_at', recentDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentAppointments) {
        recentActivities.push(...recentAppointments.map(apt => ({
          type: 'appointment',
          title: `Agendamento: ${apt.title}`,
          description: `Com ${apt.leads?.name || 'Lead não identificado'}`,
          time: apt.created_at,
          icon: 'calendar'
        })));
      }

      // Ordenar atividades por data
      recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      recentActivities.splice(5); // Manter apenas os 5 mais recentes

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
        upcomingAppointments: upcomingAppointments || [],
        recentActivities: recentActivities || [],
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