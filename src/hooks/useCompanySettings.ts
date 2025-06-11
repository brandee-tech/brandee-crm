
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CompanySettings {
  id: string;
  name: string;
  industry: string;
  size: string;
  revenue: string;
  location: string;
  website: string;
  domain: string;
  status: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  date_format: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  billing_settings: {
    auto_billing: boolean;
    invoice_email: string | null;
  };
}

export const useCompanySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      if (!user?.user_metadata?.company_id) {
        throw new Error('Company ID not found');
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.user_metadata.company_id)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      return {
        ...data,
        notification_settings: typeof data.notification_settings === 'object' && data.notification_settings !== null
          ? data.notification_settings as { email: boolean; push: boolean; sms: boolean; }
          : { email: true, push: true, sms: false },
        billing_settings: typeof data.billing_settings === 'object' && data.billing_settings !== null
          ? data.billing_settings as { auto_billing: boolean; invoice_email: string | null; }
          : { auto_billing: true, invoice_email: null }
      } as CompanySettings;
    },
    enabled: !!user?.user_metadata?.company_id,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      if (!user?.user_metadata?.company_id) {
        throw new Error('Company ID not found');
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', user.user_metadata.company_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.user_metadata?.company_id) {
        throw new Error('Company ID not found');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user_metadata.company_id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      // Update company with new logo URL
      const { data, error } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', user.user_metadata.company_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  return {
    company,
    isLoading,
    updateCompany: updateCompanyMutation.mutate,
    uploadLogo: uploadLogoMutation.mutate,
    isUpdating: updateCompanyMutation.isPending,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
};
