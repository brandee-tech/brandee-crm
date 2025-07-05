import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CurrentUserInfo {
  user_id: string;
  email: string;
  full_name: string | null;
  company_id: string | null;
  company_name: string | null;
  role_name: string | null;
  has_company: boolean;
}

export const useCurrentUser = () => {
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserInfo = async () => {
    if (!user) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Usar a função do banco para obter informações completas
      const { data, error } = await supabase.rpc('get_current_user_info');

      if (error) throw error;

      if (data && data.length > 0) {
        setUserInfo(data[0]);
      } else {
        // Se não encontrou, criar perfil básico
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // Criar perfil se não existe
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email
            });

          setUserInfo({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            company_id: null,
            company_name: null,
            role_name: null,
            has_company: false
          });
        } else {
          setUserInfo({
            user_id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name,
            company_id: profile.company_id,
            company_name: null,
            role_name: null,
            has_company: !!profile.company_id
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar informações do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  return {
    userInfo,
    loading,
    refetch: fetchUserInfo,
    hasCompany: userInfo?.has_company || false,
    companyId: userInfo?.company_id,
    isAdmin: userInfo?.role_name === 'Admin'
  };
};