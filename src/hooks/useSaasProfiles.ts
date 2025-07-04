import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaasProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    name: string;
    description: string | null;
    is_system_role: boolean;
    permissions: any;
  };
  companies?: {
    name: string;
    domain: string | null;
    plan: string | null;
  };
}

export const useSaasProfiles = () => {
  const [profiles, setProfiles] = useState<SaasProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os perfis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: string, updates: Partial<SaasProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          roles (
            name,
            description,
            is_system_role,
            permissions
          ),
          companies (
            name,
            domain,
            plan
          )
        `)
        .single();

      if (error) throw error;
      
      setProfiles(prev => prev.map(profile => profile.id === id ? data : profile));
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      toast({
        title: "Sucesso",
        description: "Perfil removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o perfil",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createUserInvitation = async (email: string, company_id: string, role_id: string, full_name: string) => {
    const webhookData = {
      email,
      company_id,
      role_id,
      full_name
    };

    const webhookUrl = 'https://n8n.sparkassessoria.com/webhook-test/7fa656f4-29ca-486a-9151-e37dc4860090';
    
    console.log('🚀 Enviando para n8n (Admin SaaS):', webhookData);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    console.log('✅ Enviado com sucesso para n8n');
  };

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  return {
    profiles,
    loading,
    updateProfile,
    deleteProfile,
    createUserInvitation,
    refetch: fetchAllProfiles
  };
};