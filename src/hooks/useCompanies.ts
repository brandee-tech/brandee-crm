
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  revenue: string | null;
  location: string | null;
  website: string | null;
  status: string | null;
  created_at: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{ ...companyData, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setCompanies(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a empresa",
        variant: "destructive"
      });
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCompanies(prev => prev.map(company => company.id === id ? data : company));
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a empresa",
        variant: "destructive"
      });
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCompanies(prev => prev.filter(company => company.id !== id));
      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a empresa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  return {
    companies,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies
  };
};
