import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';

interface LeadTag {
  id: string;
  name: string;
  color: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useLeadTags = () => {
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    if (!user || !userInfo?.company_id) {
      setLoading(false);
      return;
    }

    try {
      // Buscar tags da empresa
      const { data, error } = await supabase
        .from('lead_tags')
        .select('*')
        .eq('company_id', userInfo.company_id)
        .order('name');

      if (error) {
        console.error('Error fetching lead tags:', error);
        throw error;
      }

      setTags(data || []);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, userInfo?.company_id, toast]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (tagData: { name: string; color?: string }) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
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
        throw new Error('Company ID not found for user');
      }

      const { data, error } = await supabase
        .from('lead_tags')
        .insert([{
          name: tagData.name,
          color: tagData.color || '#3B82F6',
          company_id: profileData.company_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating tag:', error);
        throw error;
      }

      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Sucesso",
        description: "Tag criada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag",
        variant: "destructive"
      });
    }
  };

  const updateTag = async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from('lead_tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tag:', error);
        throw error;
      }

      setTags(prev => prev.map(tag => tag.id === id ? data : tag).sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Sucesso",
        description: "Tag atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tag",
        variant: "destructive"
      });
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_tags')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tag:', error);
        throw error;
      }

      setTags(prev => prev.filter(tag => tag.id !== id));
      toast({
        title: "Sucesso",
        description: "Tag removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a tag",
        variant: "destructive"
      });
    }
  };

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    refetch: fetchTags
  };
};