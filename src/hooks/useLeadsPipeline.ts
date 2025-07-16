import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';

export interface PipelineFilterState {
  searchTerm: string;
  temperature: string;
  partner_id: string;
  dateRange: { from: string; to: string };
}

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  partner_id: string | null;
  temperature: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  tags?: Array<{ id: string; name: string; color: string }>;
  partner?: { id: string; name: string; } | null;
  assigned_to?: { id: string; full_name: string | null } | null;
  latest_appointment?: {
    id: string;
    date: string;
    time: string;
    status: string;
    title: string;
  } | null;
  appointments_count?: number;
  follow_ups_count?: number;
}

export const useLeadsPipeline = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dragLoading, setDragLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<PipelineFilterState>({
    searchTerm: '',
    temperature: 'todos',
    partner_id: 'todos',
    dateRange: { from: '', to: '' }
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { columns } = usePipelineColumns();

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Buscar company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        setLeads([]);
        setLoading(false);
        return;
      }

      // Construir query base para buscar todos os leads da empresa
      let query = supabase
        .from('leads')
        .select(`
          *,
          lead_tag_assignments(
            lead_tags(id, name, color)
          ),
          partners(id, name),
          assigned_to:profiles!leads_assigned_to_fkey(id, full_name),
          appointments!appointments_lead_id_fkey(
            id, date, time, status, title,
            created_at
          )
        `)
        .eq('company_id', profileData.company_id);

      // Aplicar filtros
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      if (filters.temperature !== 'todos') {
        query = query.eq('temperature', filters.temperature);
      }

      if (filters.partner_id !== 'todos') {
        query = query.eq('partner_id', filters.partner_id);
      }

      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from);
      }

      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to + 'T23:59:59');
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Processar dados dos leads
      const processedLeads = (data || []).map(lead => {
        const appointments = lead.appointments || [];
        const latestAppointment = appointments.length > 0 
          ? appointments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null;

        return {
          ...lead,
          tags: lead.lead_tag_assignments?.map((assignment: any) => assignment.lead_tags).filter(Boolean) || [],
          partner: lead.partners || null,
          latest_appointment: latestAppointment,
          appointments_count: appointments.length,
          follow_ups_count: 0 // Será calculado em uma query separada se necessário
        };
      });
      
      console.log('Pipeline leads before filtering:', processedLeads.length);
      
      // Aplicar filtro por role após buscar os dados
      const { data: userProfile } = await supabase
        .from('profiles')
        .select(`
          id,
          roles!profiles_role_id_fkey(name)
        `)
        .eq('id', user.id)
        .single();

      const userRole = userProfile?.roles?.name;
      console.log('Pipeline user role for filtering:', userRole);

      let filteredLeads = processedLeads;
      if (userRole === 'Closer') {
        // Closers veem leads atribuídos a eles OU leads não-atribuídos (para poderem assumir)
        filteredLeads = processedLeads.filter(lead => 
          lead.assigned_to === user.id || lead.assigned_to === null
        );
        console.log('Pipeline filtering for Closer - showing assigned + unassigned leads:', filteredLeads.length);
      } else {
        // Admins, SDRs e outros roles veem todos os leads da empresa
        console.log('Pipeline user is Admin/SDR - showing all company leads:', filteredLeads.length);
      }
      
      setLeads(filteredLeads);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive"
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, filters]);

  const createLead = useCallback(async (leadData: {
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    partner_id: string | null;
    temperature: string | null;
  }) => {
    if (!user) return null;

    try {
      // Buscar company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Usuário não possui empresa associada');
      }

      // SEMPRE usar "Novo Lead" como status inicial
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          status: 'Novo Lead', // FORÇAR sempre "Novo Lead"
          temperature: leadData.temperature || 'Frio',
          company_id: profileData.company_id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchLeads();
      
      toast({
        title: "Sucesso",
        description: "Lead criado com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive"
      });
      return null;
    }
  }, [user, fetchLeads, toast]);

  const updateLeadStatus = useCallback(async (leadId: string, newStatus: string) => {
    if (!user) return;

    setDragLoading(leadId);
    try {
      // Atualização otimística
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do lead atualizado"
      });
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      // Reverter mudança otimística
      await fetchLeads();
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do lead",
        variant: "destructive"
      });
    } finally {
      setDragLoading(null);
    }
  }, [user, toast, fetchLeads]);

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const sourceStatus = result.source.droppableId;

    if (sourceStatus === newStatus) return;

    await updateLeadStatus(leadId, newStatus);
  }, [updateLeadStatus]);

  // Agrupar leads por status
  const leadsByStatus = leads.reduce((acc, lead) => {
    const status = lead.status || 'Novas Leads';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  useEffect(() => {
    if (user) {
      fetchLeads();

      // Setup realtime subscription
      const channel = supabase
        .channel(`leads-pipeline-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads'
          },
          (payload) => {
            console.log('Lead pipeline change detected:', payload);
            setIsUpdating(true);
            
            setTimeout(() => {
              fetchLeads().finally(() => {
                setIsUpdating(false);
              });
            }, 200);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchLeads]);

  return {
    leads,
    leadsByStatus,
    columns,
    loading,
    isUpdating,
    dragLoading,
    filters,
    setFilters,
    handleDragEnd,
    updateLeadStatus,
    createLead,
    refetch: fetchLeads
  };
};