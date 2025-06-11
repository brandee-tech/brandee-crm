
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSaasAdmin = () => {
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkSaasAdmin = async () => {
      if (!user) {
        setIsSaasAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_saas_admin');
        if (error) throw error;
        setIsSaasAdmin(data || false);
      } catch (error) {
        console.error('Erro ao verificar admin SaaS:', error);
        setIsSaasAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSaasAdmin();
  }, [user]);

  return { isSaasAdmin, loading };
};
