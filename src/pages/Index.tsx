
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { WhatsAppChat } from '@/components/whatsapp/WhatsAppChat';
import { OnboardingCheck } from '@/components/OnboardingCheck';
import { useAuth } from '@/hooks/useAuth';
import { LeadDialogProvider } from '@/contexts/LeadDialogContext';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detectar rota e definir aba inicial
  const getInitialTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;
    
    // Se vier de /whatsapp, ativar aba whatsapp
    if (location.pathname === '/whatsapp') return 'whatsapp';
    
    return 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [addScriptDialogOpen, setAddScriptDialogOpen] = useState(false);
  
  // Atualizar URL quando mudar de aba
  useEffect(() => {
    if (activeTab === 'whatsapp' && location.pathname !== '/whatsapp') {
      navigate('/whatsapp', { replace: true });
    } else if (activeTab !== 'whatsapp' && location.pathname === '/whatsapp') {
      navigate('/', { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);
  
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
        return <Appointments setActiveTab={setActiveTab} />;
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
      case 'whatsapp':
        return <WhatsAppChat />;
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
        <div className="h-screen bg-background flex flex-col w-full">
          <div className="flex flex-1 min-w-0 overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 flex flex-col min-h-0">
              {/* Mobile Header */}
              {activeTab !== 'whatsapp' && (
                <div className="md:hidden bg-card shadow-sm border-b p-4 flex items-center justify-between shrink-0">
                  <MobileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                  <h1 className="font-semibold text-lg">We CRM</h1>
                  <div className="w-10"></div> {/* Spacer for balance */}
                </div>
              )}
              
              {/* TopBar - visível apenas no desktop e quando não estiver no WhatsApp */}
              {activeTab !== 'whatsapp' && (
                <div className="hidden md:block shrink-0">
                  <TopBar />
                </div>
              )}
              
              {/* Main Content */}
              <div className={`flex-1 ${activeTab === 'whatsapp' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                {activeTab === 'whatsapp' ? (
                  <div className="h-full">
                    {renderContent()}
                  </div>
                ) : (
                  renderContent()
                )}
              </div>
            </main>
          </div>
        </div>
      </OnboardingCheck>
    </LeadDialogProvider>
  );
};

export default Index;
