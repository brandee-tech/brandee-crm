
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyWithStats {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
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
      console.log('useAllCompanies: Fetching companies for SaaS admin...');
      
      const { data, error } = await supabase
        .from('admin_companies_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useAllCompanies: Error fetching companies:', error);
        
        // Log error for debugging
        if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
          console.log('useAllCompanies: RLS policy blocked access - user may not be SaaS admin');
        }
        
        throw error;
      }
      
      console.log('useAllCompanies: Successfully fetched companies:', data?.length || 0);
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar empresas:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para visualizar todas as empresas. Apenas administradores do sistema podem acessar essa funcionalidade.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (id: string, status: string) => {
    try {
      console.log('useAllCompanies: Updating company status:', { id, status });
      
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('useAllCompanies: Error updating company status:', error);
        throw error;
      }
      
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? { ...company, status } : company
        )
      );

      toast({
        title: "Sucesso",
        description: "Status da empresa atualizado com sucesso"
      });
      
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para atualizar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da empresa",
          variant: "destructive"
        });
      }
    }
  };

  const deactivateCompany = async (id: string) => {
    await updateCompanyStatus(id, 'Inativa');
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('useAllCompanies: Deleting company:', { id });
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useAllCompanies: Error deleting company:', error);
        throw error;
      }
      
      setCompanies(prev => prev.filter(company => company.id !== id));

      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso"
      });
      
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para excluir empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a empresa",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, refetch: fetchCompanies, updateCompanyStatus, deactivateCompany, deleteCompany };
};
