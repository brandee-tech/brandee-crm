
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileSidebar } from '@/components/admin/AdminMobileSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CompaniesManagement } from '@/components/admin/CompaniesManagement';
import { SaasUserManagement } from '@/components/admin/SaasUserManagement';
import { useSaasAdmin } from '@/hooks/useSaasAdmin';
import { useAuth } from '@/hooks/useAuth';

const AdminSaas = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isSaasAdmin, loading: adminLoading } = useSaasAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Debug logs
  useEffect(() => {
    console.log('AdminSaas: Component mounted');
    console.log('AdminSaas: Auth loading:', authLoading);
    console.log('AdminSaas: Admin loading:', adminLoading);
    console.log('AdminSaas: User:', user);
    console.log('AdminSaas: Is SaaS Admin:', isSaasAdmin);
  }, [authLoading, adminLoading, user, isSaasAdmin]);

  // Aguardar ambos os loadings terminarem antes de fazer qualquer redirecionamento
  if (authLoading || adminLoading) {
    console.log('AdminSaas: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Só verificar user depois que loading terminou
  if (!user) {
    console.log('AdminSaas: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Só verificar admin depois que loading terminou
  if (!isSaasAdmin) {
    console.log('AdminSaas: User is not SaaS admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminSaas: Access granted, rendering admin interface');

  const handleBackToCrm = () => {
    console.log('AdminSaas: Navigating back to CRM using React Router');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'companies':
        return <CompaniesManagement />;
      case 'users':
        return <SaasUserManagement />;
      case 'analytics':
        return <div className="p-8"><h1 className="text-2xl font-bold">Analytics Avançado</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>;
      case 'settings':
        return <div className="p-8"><h1 className="text-2xl font-bold">Configurações do Sistema</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Desktop Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onBackToCrm={handleBackToCrm}
      />
      
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
          <AdminMobileSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onBackToCrm={handleBackToCrm}
          />
          <h1 className="font-semibold text-lg">Admin SaaS</h1>
          <div className="w-10"></div>
        </div>
        
        {/* Main Content */}
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminSaas;
