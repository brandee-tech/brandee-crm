
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
        // Use the secure function to check admin status
        const { data, error } = await supabase.rpc('is_saas_admin_for_company_management');
        
        if (error) {
          console.error('useSaasAdmin: Error calling is_saas_admin_for_company_management RPC:', error);
          
          // Fallback: try the original function
          console.log('useSaasAdmin: Trying fallback is_saas_admin function...');
          const { data: fallbackData, error: fallbackError } = await supabase.rpc('is_saas_admin');
          
          if (fallbackError) {
            console.error('useSaasAdmin: Fallback method also failed:', fallbackError);
            
            // Last resort: direct query (this may fail due to RLS)
            console.log('useSaasAdmin: Trying direct query fallback...');
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select(`
                role_id,
                roles!inner(name)
              `)
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('useSaasAdmin: All methods failed:', profileError);
              throw profileError;
            }

            const isAdmin = profileData?.roles?.name === 'Administrador do Sistema';
            console.log('useSaasAdmin: Direct query result:', isAdmin);
            setIsSaasAdmin(isAdmin);
          } else {
            console.log('useSaasAdmin: Fallback RPC result:', fallbackData);
            setIsSaasAdmin(fallbackData || false);
          }
        } else {
          console.log('useSaasAdmin: Primary RPC result:', data);
          setIsSaasAdmin(data || false);
        }
        
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
