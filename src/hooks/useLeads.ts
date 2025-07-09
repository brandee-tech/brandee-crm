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
  partner_id: string | null;
  company_id: string;
  created_at: string;
  tags?: Array<{ id: string; name: string; color: string }>;
  partner?: { id: string; name: string; } | null;
}

// Global subscription manager to prevent multiple subscriptions
const subscriptionManager = {
  activeChannels: new Map<string, any>(),
  
  createChannel: (channelName: string, callback: (payload: any) => void) => {
    // Clean up existing channel if it exists
    if (subscriptionManager.activeChannels.has(channelName)) {
      const existingChannel = subscriptionManager.activeChannels.get(channelName);
      supabase.removeChannel(existingChannel);
      subscriptionManager.activeChannels.delete(channelName);
    }

    // Create new channel
    const channel = supabase.channel(channelName);
    subscriptionManager.activeChannels.set(channelName, channel);
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
      .subscribe((status) => {
        console.log(`Realtime leads subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime subscription failed: ${status}`);
        }
      });

    return channel;
  },

  cleanup: (channelName: string) => {
    if (subscriptionManager.activeChannels.has(channelName)) {
      const channel = subscriptionManager.activeChannels.get(channelName);
      supabase.removeChannel(channel);
      subscriptionManager.activeChannels.delete(channelName);
    }
  }
};

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelNameRef = useRef<string | null>(null);

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

      // Agora buscar leads apenas da empresa do usuário com suas tags e parceiro
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_tag_assignments(
            lead_tags(id, name, color)
          ),
          partners(id, name)
        `)
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      // Processar dados para incluir tags e parceiro
      const processedLeads = (data || []).map(lead => ({
        ...lead,
        tags: lead.lead_tag_assignments?.map((assignment: any) => assignment.lead_tags).filter(Boolean) || [],
        partner: lead.partners || null
      }));
      
      console.log('Fetched leads for company:', processedLeads.length, 'leads');
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

  useEffect(() => {
    if (!user?.id) return;
    
    fetchLeads();

    // Create unique channel name using user ID
    const channelName = `leads-${user.id}`;
    channelNameRef.current = channelName;

    // Use subscription manager to handle the channel
    const handleRealtimeChange = (payload: any) => {
      console.log('Realtime lead change detected:', payload);
      setIsUpdating(true);
      
      // Use a small delay to prevent excessive calls
      setTimeout(() => {
        fetchLeads().finally(() => {
          setIsUpdating(false);
        });
      }, 100);
    };

    subscriptionManager.createChannel(channelName, handleRealtimeChange);

    return () => {
      if (channelNameRef.current) {
        subscriptionManager.cleanup(channelNameRef.current);
      }
    };
  }, [user?.id, fetchLeads]);

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'company_id'> & { partner_id?: string | null }) => {
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

      // SEMPRE usar "Novo Lead" como status inicial
      let finalLeadData = { ...leadData };
      finalLeadData.status = 'Novo Lead';

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
      parceiro?: string;
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

      // SEMPRE usar "Novo Lead" como status padrão para importação
      const defaultStatus = 'Novo Lead';
      console.log('Status padrão para importação definido como:', defaultStatus);

      // Buscar todos os parceiros ativos para matching por nome
      const { data: partnersData } = await supabase
        .from('partners')
        .select('id, name')
        .eq('status', 'ativo');

      let successCount = 0;
      let errorCount = 0;
      const total = csvLeads.length;

      // Função para processar dados do CSV/Excel
      const processLeadValue = (value: any): string | null => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        return String(value).trim() || null;
      };

      // Processar leads em lotes de 50 para melhor performance
      const batchSize = 50;
      console.log(`Starting import of ${total} leads in batches of ${batchSize}`);
      
      for (let i = 0; i < csvLeads.length; i += batchSize) {
        const batch = csvLeads.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.length} leads`);
        
        const leadsToInsert = batch.map(csvLead => {
          let partnerId = null;
          let source = processLeadValue(csvLead.origem);
          
          // Se há um parceiro especificado, procurar pelo nome
          if (csvLead.parceiro && processLeadValue(csvLead.parceiro)) {
            const partnerName = processLeadValue(csvLead.parceiro);
            const partner = partnersData?.find(p => 
              p.name.toLowerCase().trim() === partnerName.toLowerCase().trim()
            );
            
            if (partner) {
              partnerId = partner.id;
              source = 'Parceiro'; // Definir origem como Parceiro quando há um parceiro
            }
          }
          
          return {
            name: processLeadValue(csvLead.nome),
            email: processLeadValue(csvLead.email),
            phone: processLeadValue(csvLead.telefone),
            status: defaultStatus, // SEMPRE usar primeira coluna do pipeline
            source: source,
            partner_id: partnerId,
            created_by: user.id,
            company_id: profileData.company_id
          };
        });

        let retryCount = 0;
        const maxRetries = 3;
        let batchSuccess = false;

        while (retryCount < maxRetries && !batchSuccess) {
          try {
            const { data, error } = await supabase
              .from('leads')
              .insert(leadsToInsert)
              .select();

            if (error) {
              console.error(`Batch insert error (attempt ${retryCount + 1}):`, error);
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
              }
              errorCount += batch.length;
            } else {
              successCount += data?.length || 0;
              console.log(`Batch processed successfully: ${data?.length || 0} leads inserted`);
              batchSuccess = true;
            }
          } catch (batchError) {
            console.error(`Batch processing error (attempt ${retryCount + 1}):`, batchError);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            errorCount += batch.length;
          }
        }

        // Atualizar progresso
        const progress = ((i + batchSize) / total) * 100;
        onProgress?.(Math.min(progress, 100));

        // Pequena pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Fazer refresh completo dos dados após importação
      console.log('Import completed, refreshing leads data...');
      await fetchLeads();

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
