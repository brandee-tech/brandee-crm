
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCompanyData {
  name: string;
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
    setLoading(true);
    try {
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

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a empresa",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: UpdateCompanyData) => {
    setLoading(true);
    try {
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

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a empresa",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createCompany, updateCompany, loading };
};
