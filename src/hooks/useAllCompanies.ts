
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyWithStats {
  id: string;
  name: string;
  domain: string | null;
  plan: string | null;
  status: string | null;
  created_at: string;
  user_count: number;
  leads_count: number;
  appointments_count: number;
  phone: string | null;
  website: string | null;
  location: string | null;
}

export const useAllCompanies = () => {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_companies_view')
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

  const updateCompanyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? { ...company, status } : company
        )
      );

      toast({
        title: "Sucesso",
        description: "Status da empresa atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da empresa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, refetch: fetchCompanies, updateCompanyStatus };
};
