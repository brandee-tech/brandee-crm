
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCompanyData {
  name?: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  phone?: string;
  plan?: string;
  status?: string;
}

interface UpdateCompanyData extends CreateCompanyData {
  id: string;
}

export const useAdminCompanies = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCompany = async (data: CreateCompanyData) => {
    if (!data.name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('useAdminCompanies: Creating company:', data);
      
      const { error } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          domain: data.domain || null,
          industry: data.industry || null,
          size: data.size || null,
          location: data.location || null,
          website: data.website || null,
          phone: data.phone || null,
          plan: data.plan || 'basic',
          status: data.status || 'Prospect'
        });

      if (error) {
        console.error('useAdminCompanies: Error creating company:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para criar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a empresa",
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: UpdateCompanyData) => {
    if (!data.name) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('useAdminCompanies: Updating company:', data);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: data.name,
          domain: data.domain || null,
          industry: data.industry || null,
          size: data.size || null,
          location: data.location || null,
          website: data.website || null,
          phone: data.phone || null,
          plan: data.plan,
          status: data.status
        })
        .eq('id', data.id);

      if (error) {
        console.error('useAdminCompanies: Error updating company:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      
      if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para atualizar empresas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a empresa",
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createCompany, updateCompany, loading };
};
