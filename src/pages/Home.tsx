
import { useAuth } from '@/hooks/useAuth';
import Index from './Index';
import Landing from './Landing';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se o usuário está logado, mostra o dashboard
  if (user) {
    return <Index />;
  }

  // Se não está logado, mostra a landing page
  return <Landing />;
};

export default Home;
