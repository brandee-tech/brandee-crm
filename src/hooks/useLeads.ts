import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  company_id: string;
  created_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching leads for user:', user.id);
      
      // Primeiro buscar o company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Erro",
          description: "Erro ao buscar perfil do usuário",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!profileData?.company_id) {
        console.error('User has no company_id configured');
        toast({
          title: "Erro",
          description: "Usuário não tem empresa configurada",
          variant: "destructive"
        });
        setLeads([]);
        setLoading(false);
        return;
      }

      console.log('User company_id:', profileData.company_id);

      // Agora buscar leads apenas da empresa do usuário
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      console.log('Fetched leads for company:', data?.length || 0, 'leads');
      console.log('Fetched leads:', data);
      setLeads(data || []);
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

  useEffect(() => {
    if (!user?.id) return;
    
    fetchLeads();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime leads channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Guard: Only create subscription if user is still available
    if (!user?.id) return cleanup;

    // Create unique channel name using user ID and timestamp
    const channelName = `realtime-leads-${user.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Realtime lead change detected:', payload);
          setIsUpdating(true);
          
          // Use a small delay to prevent excessive calls
          setTimeout(() => {
            fetchLeads().finally(() => {
              setIsUpdating(false);
            });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Realtime leads subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Realtime subscription failed:', status);
          // Don't retry immediately to avoid infinite loops
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user?.id, fetchLeads]);

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'company_id'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating lead:', leadData);
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData?.company_id) {
        throw new Error('Company ID not found for user');
      }

      // Se não foi especificado status, usar a primeira coluna do pipeline
      let finalLeadData = { ...leadData };
      if (!finalLeadData.status) {
        const { data: firstColumn } = await supabase
          .from('pipeline_columns')
          .select('name')
          .eq('company_id', profileData.company_id)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();
        
        if (firstColumn) {
          finalLeadData.status = firstColumn.name;
        }
      }

      const { data, error } = await supabase
        .from('leads')
        .insert([{ 
          ...finalLeadData, 
          created_by: user.id,
          company_id: profileData.company_id 
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }
      
      console.log('Lead created successfully:', data);
      setLeads(prev => [data, ...prev]);
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
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating lead:', id, updates);
      
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
      
      console.log('Lead updated successfully:', data);
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead",
        variant: "destructive"
      });
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Attempting to delete lead:', id);
      
      // Primeiro, verificar se o lead existe e pertence à empresa do usuário
      const { data: leadData, error: fetchError } = await supabase
        .from('leads')
        .select('id, company_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching lead for validation:', fetchError);
        toast({
          title: "Erro",
          description: "Lead não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Verificar company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Erro",
          description: "Erro de configuração da empresa",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o usuário pode deletar este lead
      if (leadData.company_id !== profileData.company_id) {
        console.error('Permission denied: different company');
        toast({
          title: "Erro",
          description: "Você não tem permissão para deletar este lead",
          variant: "destructive"
        });
        return;
      }

      // Executar o delete com returning para confirmar
      const { data: deletedData, error: deleteError, count } = await supabase
        .from('leads')
        .delete({ count: 'exact' })
        .eq('id', id)
        .select();

      if (deleteError) {
        console.error('Error deleting lead:', deleteError);
        throw deleteError;
      }

      // Verificar se alguma linha foi realmente deletada
      if (!deletedData || deletedData.length === 0 || count === 0) {
        console.error('No rows were deleted');
        toast({
          title: "Erro",
          description: "Não foi possível remover o lead. Verifique suas permissões.",
          variant: "destructive"
        });
        return;
      }

      console.log('Lead deleted successfully. Rows affected:', count);
      
      // Remover do estado local apenas se o delete foi confirmado
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Lead removido com sucesso"
      });
      
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o lead",
        variant: "destructive"
      });
    }
  };

  const importLeadsFromCSV = async (
    csvLeads: Array<{
      nome: string;
      email?: string;
      telefone?: string;
      status?: string;
      origem?: string;
    }>,
    onProgress?: (progress: number) => void
  ) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return { success: 0, errors: 0, total: 0 };
    }

    try {
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Company ID not found for user');
      }

      // Buscar primeira coluna do pipeline para status padrão
      const { data: firstColumn } = await supabase
        .from('pipeline_columns')
        .select('name')
        .eq('company_id', profileData.company_id)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      const defaultStatus = firstColumn?.name || 'Frio';

      let successCount = 0;
      let errorCount = 0;
      const total = csvLeads.length;

      // Processar leads em lotes de 10
      const batchSize = 10;
      for (let i = 0; i < csvLeads.length; i += batchSize) {
        const batch = csvLeads.slice(i, i + batchSize);
        
        const leadsToInsert = batch.map(csvLead => ({
          name: csvLead.nome.trim(),
          email: csvLead.email?.trim() || null,
          phone: csvLead.telefone?.trim() || null,
          status: csvLead.status?.trim() || defaultStatus,
          source: csvLead.origem?.trim() || null,
          created_by: user.id,
          company_id: profileData.company_id
        }));

        try {
          const { data, error } = await supabase
            .from('leads')
            .insert(leadsToInsert)
            .select();

          if (error) {
            console.error('Batch insert error:', error);
            errorCount += batch.length;
          } else {
            successCount += data?.length || 0;
            // Adicionar leads criados ao estado local
            if (data) {
              setLeads(prev => [...data, ...prev]);
            }
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          errorCount += batch.length;
        }

        // Atualizar progresso
        const progress = ((i + batchSize) / total) * 100;
        onProgress?.(Math.min(progress, 100));

        // Pequena pausa entre lotes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const results = { success: successCount, errors: errorCount, total };
      
      if (successCount > 0) {
        toast({
          title: "Sucesso",
          description: `${successCount} leads importados com sucesso`
        });
      }

      return results;
    } catch (error) {
      console.error('Erro ao importar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os leads",
        variant: "destructive"
      });
      return { success: 0, errors: csvLeads.length, total: csvLeads.length };
    }
  };

  return {
    leads,
    loading,
    isUpdating,
    createLead,
    updateLead,
    deleteLead,
    importLeadsFromCSV,
    refetch: fetchLeads
  };
};
