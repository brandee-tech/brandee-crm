
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { TopBar } from '@/components/TopBar';
import { Dashboard } from '@/components/Dashboard';
import { Leads } from '@/components/Leads';
import { Kanban } from '@/components/Kanban';
import { LeadsPipeline } from '@/components/LeadsPipeline';
import { LeadTagsManagement } from '@/components/LeadTagsManagement';
import { Products } from '@/components/Products';
import { Appointments } from '@/components/Appointments';
import { Meetings } from '@/components/Meetings';
import { CalendarView } from '@/components/Calendar';
import { Tasks } from '@/components/Tasks';
import { Scripts } from '@/components/Scripts';
import { Reports } from '@/components/Reports';
import { UserManagement } from '@/components/UserManagement';
import { Settings } from '@/components/Settings';
import { Partners } from '@/components/Partners';
import { ScheduleBlockManagement } from '@/components/ScheduleBlockManagement';
import { OnboardingCheck } from '@/components/OnboardingCheck';
import { useAuth } from '@/hooks/useAuth';
import { LeadDialogProvider } from '@/contexts/LeadDialogContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [addScriptDialogOpen, setAddScriptDialogOpen] = useState(false);
  
  // Script form state
  const [scriptFormData, setScriptFormData] = useState({
    title: '',
    content: '',
    category: 'Vendas',
    description: ''
  });
  const [createdScriptId, setCreatedScriptId] = useState<string | null>(null);
  
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
      case 'leadsPipeline':
        return <LeadsPipeline />;
      case 'leadTags':
        return <LeadTagsManagement />;
      case 'products':
        return <Products />;
      case 'kanban':
        return <Kanban />;
      case 'appointments':
        return <Appointments />;
      case 'meetings':
        return <Meetings />;
      case 'calendar':
        return <CalendarView />;
      case 'scheduleBlocks':
        return <ScheduleBlockManagement />;
      case 'tasks':
        return <Tasks />;
      case 'scripts':
        return <Scripts 
          addDialogOpen={addScriptDialogOpen} 
          setAddDialogOpen={setAddScriptDialogOpen}
          scriptFormData={scriptFormData}
          setScriptFormData={setScriptFormData}
          createdScriptId={createdScriptId}
          setCreatedScriptId={setCreatedScriptId}
        />;
      case 'reports':
        return <Reports />;
      case 'partners':
        return <Partners />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LeadDialogProvider>
      <OnboardingCheck>
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile Header */}
              <div className="md:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
                <MobileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <h1 className="font-semibold text-lg">We CRM</h1>
                <div className="w-10"></div> {/* Spacer for balance */}
              </div>
              
              {/* TopBar - visível apenas no desktop */}
              <div className="hidden md:block">
                <TopBar />
              </div>
              
              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </OnboardingCheck>
    </LeadDialogProvider>
  );
};

export default Index;
