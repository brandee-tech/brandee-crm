
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileSidebar } from '@/components/admin/AdminMobileSidebar';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CompaniesManagement } from '@/components/admin/CompaniesManagement';
import { useSaasAdmin } from '@/hooks/useSaasAdmin';
import { useAuth } from '@/hooks/useAuth';

const AdminSaas = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isSaasAdmin, loading: adminLoading } = useSaasAdmin();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isSaasAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleBackToCrm = () => {
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'companies':
        return <CompaniesManagement />;
      case 'users':
        return <div className="p-8"><h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1><p className="text-gray-600 mt-2">Em desenvolvimento...</p></div>;
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
