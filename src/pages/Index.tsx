
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Leads } from '@/components/Leads';
import { Tasks } from '@/components/Tasks';
import { Reports } from '@/components/Reports';
import { RoleManagement } from '@/components/RoleManagement';
import { Kanban } from '@/components/Kanban';
import { Scripts } from '@/components/Scripts';
import { Appointments } from '@/components/Appointments';
import { CalendarView } from '@/components/Calendar';
import { UserManagement } from '@/components/UserManagement';
import { Companies } from '@/components/Companies';
import { Meetings } from '@/components/Meetings';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads />;
      case 'companies':
        return <Companies />;
      case 'tasks':
        return <Tasks />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <RoleManagement />;
      case 'users':
        return <UserManagement />;
      case 'kanban':
        return <Kanban />;
      case 'scripts':
        return <Scripts />;
      case 'appointments':
        return <Appointments />;
      case 'meetings':
        return <Meetings />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
