
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PipelineColumn {
  id: string;
  company_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
  is_protected?: boolean;
}

export const usePipelineColumns = () => {
  const [columns, setColumns] = useState<PipelineColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchColumns = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching pipeline columns for user:', user.id);
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error('Erro ao buscar company_id:', profileError);
        throw new Error('Company ID not found for user');
      }

      const { data, error } = await supabase
        .from('pipeline_columns')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching pipeline columns:', error);
        throw error;
      }
      
      console.log('Fetched pipeline columns:', data?.length || 0, 'columns');
      setColumns(data || []);
    } catch (error) {
      console.error('Erro ao buscar colunas do pipeline:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as colunas do pipeline",
        variant: "destructive"
      });
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const createColumn = async (columnData: Omit<PipelineColumn, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating pipeline column:', columnData);
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Company ID not found for user');
      }

      const { data, error } = await supabase
        .from('pipeline_columns')
        .insert([{ 
          ...columnData, 
          company_id: profileData.company_id 
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating pipeline column:', error);
        throw error;
      }
      
      console.log('Pipeline column created successfully:', data);
      setColumns(prev => [...prev, data].sort((a, b) => a.position - b.position));
      toast({
        title: "Sucesso",
        description: "Coluna criada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar coluna:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a coluna",
        variant: "destructive"
      });
    }
  };

  const updateColumn = async (id: string, updates: Partial<PipelineColumn>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating pipeline column:', id, updates);
      
      const { data, error } = await supabase
        .from('pipeline_columns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pipeline column:', error);
        throw error;
      }
      
      console.log('Pipeline column updated successfully:', data);
      setColumns(prev => prev.map(col => col.id === id ? data : col).sort((a, b) => a.position - b.position));
      toast({
        title: "Sucesso",
        description: "Coluna atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coluna",
        variant: "destructive"
      });
    }
  };

  const deleteColumn = async (id: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Deleting pipeline column:', id);
      
      const { error } = await supabase
        .from('pipeline_columns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pipeline column:', error);
        throw error;
      }
      
      console.log('Pipeline column deleted successfully');
      setColumns(prev => prev.filter(col => col.id !== id));
      toast({
        title: "Sucesso",
        description: "Coluna removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a coluna",
        variant: "destructive"
      });
    }
  };

  const reorderColumns = async (newOrder: PipelineColumn[]) => {
    try {
      console.log('Reordering pipeline columns');
      
      const updates = newOrder.map((col, index) => ({
        id: col.id,
        position: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('pipeline_columns')
          .update({ position: update.position })
          .eq('id', update.id);
      }
      
      setColumns(newOrder);
      toast({
        title: "Sucesso",
        description: "Ordem das colunas atualizada"
      });
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar as colunas",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchColumns();
    }
  }, [user]);

  return {
    columns,
    loading,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refetch: fetchColumns
  };
};
