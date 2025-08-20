
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const { userInfo, loading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete && userInfo && !userInfo.has_company) {
      // Só redirecionar se não estiver já na página de registro de empresa
      if (location.pathname !== '/company-registration') {
        console.log('Redirecionando usuário sem empresa para configuração');
        navigate('/company-registration');
      }
    }
  }, [userInfo, initialLoadComplete, navigate, location.pathname]);

  // Only show loading on initial load, not on revalidations
  if (!initialLoadComplete) {
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
