
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
        console.log('useSaasAdmin: No user logged in');
        setIsSaasAdmin(false);
        setLoading(false);
        return;
      }

      console.log('useSaasAdmin: Checking admin status for user:', user.id);

      try {
        const { data, error } = await supabase.rpc('is_saas_admin');
        
        if (error) {
          console.error('useSaasAdmin: Error calling is_saas_admin RPC:', error);
          throw error;
        }
        
        console.log('useSaasAdmin: RPC result:', data);
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
