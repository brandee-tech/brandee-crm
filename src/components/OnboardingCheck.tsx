import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const { userInfo, loading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userInfo && !userInfo.has_company) {
      // Usuário está logado mas não tem empresa, redirecionar para registro
      navigate('/company-registration');
    }
  }, [userInfo, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator text="Verificando configuração..." />
      </div>
    );
  }

  // Se não tem company, não renderizar nada (será redirecionado)
  if (userInfo && !userInfo.has_company) {
    return null;
  }

  return <>{children}</>;
};