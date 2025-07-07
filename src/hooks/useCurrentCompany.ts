import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';

interface CurrentCompany {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  whatsapp_enabled?: boolean;
  whatsapp_phone?: string;
  whatsapp_message?: string;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  timezone?: string;
  currency?: string;
  date_format?: string;
  created_at: string;
  updated_at: string;
}

export const useCurrentCompany = () => {
  const [company, setCompany] = useState<CurrentCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();

  const fetchCompany = async () => {
    if (!userInfo?.company_id) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userInfo.company_id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (updates: Partial<CurrentCompany>) => {
    if (!userInfo?.company_id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      const { data, error } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userInfo.company_id)
        .select()
        .single();

      if (error) throw error;
      
      setCompany(data);
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!userInfo?.company_id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userInfo.company_id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      await updateCompany({ logo_url: publicUrl });
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do logo",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [userInfo?.company_id]);

  return {
    company,
    loading,
    updating,
    updateCompany,
    uploadLogo,
    refetch: fetchCompany,
    // Legacy compatibility for existing components
    settings: company,
    updateCompanySettings: updateCompany,
    isLoading: loading,
    mutate: updateCompany,
    isPending: updating,
    isUploadingLogo: updating
  };
};