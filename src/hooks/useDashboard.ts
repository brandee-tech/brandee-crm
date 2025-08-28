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

export const useDashboard = (closerId?: string) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Evitar múltiplas chamadas simultâneas
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      
      // Verificar se o usuário tem company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        // Se não tem empresa, retornar dados vazios sem erro
        const emptyStats = {
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
        };
        setStats(emptyStats);
        setLoading(false);
        setIsLoading(false);
        return;
      }
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      console.log('Dashboard filtering by company_id:', profile.company_id);
      
      // Build base queries with company filter
      let leadsQuery = supabase.from('leads').select('*', { count: 'exact' }).eq('company_id', profile.company_id);
      let contactsQuery = supabase.from('contacts').select('*', { count: 'exact' }).eq('company_id', profile.company_id);
      let tasksQuery = supabase.from('tasks').select('*', { count: 'exact' }).eq('company_id', profile.company_id);
      let appointmentsQuery = supabase.from('appointments').select('*', { count: 'exact' }).eq('company_id', profile.company_id);

      // Apply closer filter if provided
      if (closerId) {
        leadsQuery = leadsQuery.eq('assigned_to', closerId);
        contactsQuery = contactsQuery.eq('assigned_to', closerId);
        tasksQuery = tasksQuery.eq('assigned_to', closerId);
        appointmentsQuery = appointmentsQuery.eq('assigned_to', closerId);
      }

      // Fetch current counts
      const [
        leadsResult,
        contactsResult,
        tasksResult,
        appointmentsResult,
      ] = await Promise.all([
        leadsQuery,
        contactsQuery,
        tasksQuery,
        appointmentsQuery,
      ]);
      
      console.log('Dashboard counts - Leads:', leadsResult.count, 'Contacts:', contactsResult.count);

      // Build current month queries
      let currentLeadsQuery = supabase.from('leads').select('*', { count: 'exact' }).eq('company_id', profile.company_id).gte('created_at', currentMonthStart.toISOString());
      let currentContactsQuery = supabase.from('contacts').select('*', { count: 'exact' }).eq('company_id', profile.company_id).gte('created_at', currentMonthStart.toISOString());
      let currentTasksQuery = supabase.from('tasks').select('*', { count: 'exact' }).eq('company_id', profile.company_id).gte('created_at', currentMonthStart.toISOString());
      let currentAppointmentsQuery = supabase.from('appointments').select('*', { count: 'exact' }).eq('company_id', profile.company_id).gte('created_at', currentMonthStart.toISOString());

      // Apply closer filter if provided
      if (closerId) {
        currentLeadsQuery = currentLeadsQuery.eq('assigned_to', closerId);
        currentContactsQuery = currentContactsQuery.eq('assigned_to', closerId);
        currentTasksQuery = currentTasksQuery.eq('assigned_to', closerId);
        currentAppointmentsQuery = currentAppointmentsQuery.eq('assigned_to', closerId);
      }

      // Fetch data for current month comparison
      const [
        currentLeadsResult,
        currentContactsResult,
        currentTasksResult,
        currentAppointmentsResult,
      ] = await Promise.all([
        currentLeadsQuery,
        currentContactsQuery,
        currentTasksQuery,
        currentAppointmentsQuery,
      ]);

      // Build last month queries
      let lastLeadsQuery = supabase.from('leads').select('*', { count: 'exact' })
        .eq('company_id', profile.company_id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());
      let lastContactsQuery = supabase.from('contacts').select('*', { count: 'exact' })
        .eq('company_id', profile.company_id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());
      let lastTasksQuery = supabase.from('tasks').select('*', { count: 'exact' })
        .eq('company_id', profile.company_id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());
      let lastAppointmentsQuery = supabase.from('appointments').select('*', { count: 'exact' })
        .eq('company_id', profile.company_id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      // Apply closer filter if provided
      if (closerId) {
        lastLeadsQuery = lastLeadsQuery.eq('assigned_to', closerId);
        lastContactsQuery = lastContactsQuery.eq('assigned_to', closerId);
        lastTasksQuery = lastTasksQuery.eq('assigned_to', closerId);
        lastAppointmentsQuery = lastAppointmentsQuery.eq('assigned_to', closerId);
      }

      // Fetch data for last month comparison
      const [
        lastLeadsResult,
        lastContactsResult,
        lastTasksResult,
        lastAppointmentsResult,
      ] = await Promise.all([
        lastLeadsQuery,
        lastContactsQuery,
        lastTasksQuery,
        lastAppointmentsQuery,
      ]);

      // Fetch recent leads with creator information
      let recentLeadsQuery = supabase
        .from('leads')
        .select(`
          *,
          creator:profiles!leads_created_by_fkey (full_name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (closerId) {
        recentLeadsQuery = recentLeadsQuery.eq('assigned_to', closerId);
      }

      const { data: recentLeads } = await recentLeadsQuery;

      // Fetch upcoming appointments (próximos 7 dias)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      let upcomingAppointmentsQuery = supabase
        .from('appointments')
        .select(`
          *,
          leads (name, phone),
          assigned_closer:profiles!appointments_assigned_to_fkey (full_name)
        `)
        .eq('company_id', profile.company_id)
        .gte('date', tomorrow.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(5);

      if (closerId) {
        upcomingAppointmentsQuery = upcomingAppointmentsQuery.eq('assigned_to', closerId);
      }

      const { data: upcomingAppointments } = await upcomingAppointmentsQuery;

      // Fetch recent activities (últimos leads, agendamentos e tarefas criados)
      const recentActivities = [];
      
      // Adicionar leads recentes com informações do criador
      if (recentLeads) {
        recentActivities.push(...recentLeads.slice(0, 3).map(lead => ({
          type: 'lead',
          title: `Novo lead: ${lead.name}`,
          description: `Lead criado por ${lead.creator?.full_name || 'Usuário'}`,
          time: lead.created_at,
          icon: 'user'
        })));
      }

      // Adicionar agendamentos recentes (últimos 3 dias)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3);
      
      let recentAppointmentsQuery = supabase
        .from('appointments')
        .select(`
          *,
          leads (name),
          assigned_closer:profiles!appointments_assigned_to_fkey (full_name)
        `)
        .eq('company_id', profile.company_id)
        .gte('created_at', recentDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (closerId) {
        recentAppointmentsQuery = recentAppointmentsQuery.eq('assigned_to', closerId);
      }

      const { data: recentAppointments } = await recentAppointmentsQuery;

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

      // Fetch detailed data for statistics (filtered by company and closer if provided)
      let allLeadsQuery = supabase.from('leads').select('*').eq('company_id', profile.company_id);
      let allTasksQuery = supabase.from('tasks').select('status').eq('company_id', profile.company_id);
      let allAppointmentsQuery = supabase.from('appointments').select('status').eq('company_id', profile.company_id);

      if (closerId) {
        allLeadsQuery = allLeadsQuery.eq('assigned_to', closerId);
        allTasksQuery = allTasksQuery.eq('assigned_to', closerId);
        allAppointmentsQuery = allAppointmentsQuery.eq('assigned_to', closerId);
      }

      const { data: allLeads } = await allLeadsQuery;
      const { data: allTasks } = await allTasksQuery;
      const { data: allAppointments } = await allAppointmentsQuery;

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

      // Calculate conversion rate (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const leadsCreatedLast30Days = allLeads?.filter(lead => 
        new Date(lead.created_at) >= thirtyDaysAgo
      ).length || 0;
      
      const leadsSoldLast30Days = allLeads?.filter(lead => 
        lead.status === 'Vendido' && new Date(lead.updated_at) >= thirtyDaysAgo
      ).length || 0;
      
      const conversionRate = leadsCreatedLast30Days > 0 ? (leadsSoldLast30Days / leadsCreatedLast30Days) * 100 : 0;

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
      // Não mostrar toast, apenas logar o erro
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, closerId]);

  return {
    stats,
    loading,
    refetch: fetchDashboardData
  };
};