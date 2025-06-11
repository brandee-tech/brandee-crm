
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Dashboard } from '@/components/Dashboard';
import { Leads } from '@/components/Leads';
import { Kanban } from '@/components/Kanban';
import { Appointments } from '@/components/Appointments';
import { Meetings } from '@/components/Meetings';
import { CalendarView } from '@/components/Calendar';
import { Tasks } from '@/components/Tasks';
import { Scripts } from '@/components/Scripts';
import { Reports } from '@/components/Reports';
import { UserManagement } from '@/components/UserManagement';
import { Settings } from '@/components/Settings';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Este componente agora só é renderizado quando o usuário está logado
  // (a lógica de verificação foi movida para Home.tsx)
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads />;
      case 'kanban':
        return <Kanban />;
      case 'appointments':
        return <Appointments />;
      case 'meetings':
        return <Meetings />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <Tasks />;
      case 'scripts':
        return <Scripts />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <MobileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <h1 className="font-semibold text-lg">CRM System</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        
        {/* Main Content */}
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
