
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const usePipelineSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const syncPipelineColumns = async () => {
    if (!user) return;

    setSyncing(true);
    try {
      console.log('Syncing pipeline columns...');

      // Call the sync function
      const { error } = await supabase.rpc('sync_appointment_status_with_pipeline');

      if (error) {
        console.error('Error syncing pipeline columns:', error);
        throw error;
      }

      console.log('Pipeline columns synced successfully');
      toast({
        title: "Sucesso",
        description: "Colunas do pipeline sincronizadas com sucesso"
      });

      // Refresh the page to reload the columns
      window.location.reload();
    } catch (error) {
      console.error('Erro ao sincronizar colunas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar as colunas do pipeline",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const createDefaultColumns = async (pipelineId: string) => {
    if (!user || !pipelineId) return;

    setSyncing(true);
    try {
      console.log('Creating default pipeline columns for pipeline:', pipelineId);

      // Get user's company_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Company ID not found for user');
      }

      const defaultColumns = [
        { name: 'Novo Lead', color: '#6B7280', position: 1 },
        { name: 'Atendimento', color: '#3B82F6', position: 2 },
        { name: 'Agendamento', color: '#F59E0B', position: 3 },
        { name: 'Follow up', color: '#8B5CF6', position: 4 },
        { name: 'Negociação', color: '#06B6D4', position: 5 }
      ];

      const columnsToInsert = defaultColumns.map(col => ({
        pipeline_id: pipelineId,
        company_id: profileData.company_id,
        name: col.name,
        color: col.color,
        position: col.position
      }));

      // Direct insert instead of legacy RPC
      const { error } = await supabase
        .from('pipeline_columns')
        .insert(columnsToInsert);

      if (error) {
        console.error('Error creating default columns:', error);
        throw error;
      }

      console.log('Default columns created successfully');
      toast({
        title: "Sucesso",
        description: "Colunas padrão criadas com sucesso"
      });

      // Refresh logic handled by parent refetch, but if needed we can trigger logic here
      // Removing window.reload as parent should handle refetch via hook
    } catch (error) {
      console.error('Erro ao criar colunas padrão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar as colunas padrão",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncPipelineColumns,
    createDefaultColumns,
    syncing
  };
};
