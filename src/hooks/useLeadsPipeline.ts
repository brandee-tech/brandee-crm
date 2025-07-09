import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  partner_id: string | null;
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

      // Buscar leads com dados relacionados
      const { data, error } = await supabase
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
        .eq('company_id', profileData.company_id)
        .order('updated_at', { ascending: false });

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
      
      setLeads(processedLeads);
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
  }, [user?.id, toast]);

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
    const status = lead.status || 'Novo Lead';
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
              fetchLeads();
              setIsUpdating(false);
            }, 500);
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
    handleDragEnd,
    updateLeadStatus,
    refetch: fetchLeads
  };
};