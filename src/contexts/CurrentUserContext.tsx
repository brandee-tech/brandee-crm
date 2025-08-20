import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CurrentUserInfo {
  user_id: string;
  email: string;
  full_name: string | null;
  company_id: string | null;
  company_name: string | null;
  role_name: string | null;
  has_company: boolean;
}

interface CurrentUserContextType {
  userInfo: CurrentUserInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  hasCompany: boolean;
  companyId: string | null;
  isAdmin: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

const fetchUserInfo = async (userId: string, userEmail: string, userMetadata: any): Promise<CurrentUserInfo> => {
  try {
    // Usar a função do banco para obter informações completas
    const { data, error } = await supabase.rpc('get_current_user_info');

    if (error) throw error;

    if (data && data.length > 0) {
      return data[0];
    }

    // Se não encontrou, verificar se existe perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      // Criar perfil se não existe
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          full_name: userMetadata?.full_name || userEmail
        });

      return {
        user_id: userId,
        email: userEmail || '',
        full_name: userMetadata?.full_name || userEmail || '',
        company_id: null,
        company_name: null,
        role_name: null,
        has_company: false
      };
    }

    return {
      user_id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name,
      company_id: profile.company_id,
      company_name: null,
      role_name: null,
      has_company: !!profile.company_id
    };
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    throw error;
  }
};

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const {
    data: userInfo,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['currentUser', user?.id],
    queryFn: () => fetchUserInfo(user!.id, user!.email!, user!.user_metadata),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error?.message?.includes('company_id')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const contextValue: CurrentUserContextType = {
    userInfo: userInfo || null,
    loading,
    error: error as Error | null,
    refetch: () => refetch(),
    hasCompany: userInfo?.has_company || false,
    companyId: userInfo?.company_id || null,
    isAdmin: userInfo?.role_name === 'Admin' || userInfo?.role_name === 'Administrador'
  };

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserContext = () => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error('useCurrentUserContext must be used within a CurrentUserProvider');
  }
  return context;
};