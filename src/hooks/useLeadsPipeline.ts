import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useLeadAuditLog } from '@/hooks/useLeadAuditLog';

export type SortOrder = 'last_event' | 'created_at' | 'name' | 'sale';

export interface PipelineFilterState {
  searchTerm: string;
  temperature: string;
  partner_id: string;
  tags: string[];
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
  product_value: number | null;
  product_name: string | null;
  revenue_generated: number | null;
  revenue_lost: number | null;
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
  const [sortOrder, setSortOrder] = useState<SortOrder>('created_at');
  const [filters, setFilters] = useState<PipelineFilterState>({
    searchTerm: '',
    temperature: 'todos',
    partner_id: 'todos',
    tags: [],
    dateRange: { from: '', to: '' }
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { columns } = usePipelineColumns();
  const { logCreate, logStatusChange } = useLeadAuditLog();

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
      
      // Aplicar filtro por tags se selecionadas
      let filteredByTags = processedLeads;
      if (filters.tags && filters.tags.length > 0) {
        filteredByTags = processedLeads.filter(lead => {
          const leadTagIds = lead.tags?.map(tag => tag.id) || [];
          return filters.tags.some(tagId => leadTagIds.includes(tagId));
        });
        console.log('Pipeline filtering by tags - showing leads with selected tags:', filteredByTags.length);
      }
      
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

      let filteredLeads = filteredByTags;
      if (userRole === 'Closer') {
        // Closers veem leads atribuídos a eles OU leads não-atribuídos (para poderem assumir)
        filteredLeads = filteredByTags.filter(lead => 
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

      // Registrar audit log de criação
      await logCreate(data.id, profileData.company_id, data);

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
  }, [user, fetchLeads, toast, logCreate]);

  const updateLeadStatus = useCallback(async (leadId: string, newStatus: string) => {
    if (!user) return;

    setDragLoading(leadId);
    
    try {
      console.log('🔄 Updating lead status:', leadId, 'to:', newStatus);

      // Buscar dados atuais do lead para audit log
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('status, company_id')
        .eq('id', leadId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current lead:', fetchError);
        throw fetchError;
      }

      const oldStatus = currentLead.status || 'Novo Lead';

      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error updating lead status:', error);
        throw error;
      }

      console.log('✅ Lead status updated successfully:', data);
      
      // Registrar audit log de mudança de status
      await logStatusChange(leadId, currentLead.company_id, oldStatus, newStatus);
      
      // Atualização local imediata após confirmação do banco
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { 
          ...lead, 
          status: newStatus,
          updated_at: new Date().toISOString()
        } : lead
      ));
      
      toast({
        title: "Sucesso",
        description: `Lead movido para "${newStatus}" com sucesso`
      });
    } catch (error) {
      console.error('❌ Error updating lead status:', error);
      // Refetch para garantir consistência
      await fetchLeads();
      toast({
        title: "Erro",
        description: `Não foi possível mover o lead para "${newStatus}". ${error.message || ''}`,
        variant: "destructive"
      });
    } finally {
      setDragLoading(null);
    }
  }, [user, toast, fetchLeads, logStatusChange]);

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const sourceStatus = result.source.droppableId;

    if (sourceStatus === newStatus) return;

    console.log('🔄 Drag end - Moving lead:', leadId, 'from:', sourceStatus, 'to:', newStatus);
    
    // Verificar se a coluna de destino existe
    const targetColumn = columns.find(col => col.name === newStatus);
    if (!targetColumn) {
      console.error('❌ Target column not found:', newStatus);
      toast({
        title: "Erro",
        description: "Coluna de destino não encontrada",
        variant: "destructive"
      });
      return;
    }

    await updateLeadStatus(leadId, newStatus);
  }, [updateLeadStatus, columns, toast]);

  // Aplicar ordenação aos leads
  const sortLeads = (leadsToSort: Lead[]): Lead[] => {
    return [...leadsToSort].sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'last_event':
          const aDate = a.latest_appointment?.date || a.updated_at;
          const bDate = b.latest_appointment?.date || b.updated_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        case 'sale':
          const saleStatuses = ['Ganho', 'Venda', 'Fechado'];
          const aIsSale = saleStatuses.includes(a.status || '');
          const bIsSale = saleStatuses.includes(b.status || '');
          if (aIsSale && !bIsSale) return -1;
          if (!aIsSale && bIsSale) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });
  };

  // Agrupar leads por status, garantindo que todas as colunas existam
  const leadsByStatus = columns.reduce((acc, column) => {
    acc[column.name] = [];
    return acc;
  }, {} as Record<string, Lead[]>);

  // Aplicar ordenação e adicionar leads aos seus respectivos status
  const sortedLeads = sortLeads(leads);
  sortedLeads.forEach(lead => {
    const status = lead.status || 'Novo Lead';
    // Se o status do lead corresponde a uma coluna, adiciona lá
    if (leadsByStatus[status] !== undefined) {
      leadsByStatus[status].push(lead);
    } else {
      // Se não corresponde a nenhuma coluna, adiciona na primeira coluna
      const firstColumn = columns[0];
      if (firstColumn) {
        console.warn(`⚠️ Lead ${lead.id} tem status "${status}" que não corresponde a nenhuma coluna. Movendo para "${firstColumn.name}"`);
        leadsByStatus[firstColumn.name].push(lead);
      }
    }
  });

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
            
            // Evitar refetch durante drag and drop
            if (!dragLoading) {
              setTimeout(() => {
                fetchLeads();
              }, 500);
            }
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
    refetch: fetchLeads,
    sortOrder,
    setSortOrder
  };
};