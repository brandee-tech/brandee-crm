
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useSaasAdmin } from '@/hooks/useSaasAdmin';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  UserPlus,
  Kanban,
  FileText,
  Calendar,
  CalendarDays,
  Video,
  Shield,
  Package,
  Handshake,
  Clock,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileSidebar = ({ activeTab, setActiveTab }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { company, isLoading } = useCompanySettings();
  const { isSaasAdmin } = useSaasAdmin();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserPlus },
    { id: 'leadsPipeline', label: 'Pipeline de Leads', icon: Kanban },
    { id: 'leadTags', label: 'Tags de Leads', icon: Tag },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'meetings', label: 'Reuniões', icon: Video },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays },
    { id: 'scheduleBlocks', label: 'Gerenciar Horários', icon: Clock },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'scripts', label: 'Materiais', icon: FileText },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'partners', label: 'Parceiros', icon: Handshake },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, route: '/whatsapp' },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleItemClick = (item: any) => {
    if (item.route) {
      navigate(item.route);
    } else {
      setActiveTab(item.id);
    }
    setIsOpen(false);
  };

  const handleAdminSaasClick = () => {
    // Use react-router navigation instead of window.location
    setActiveTab('admin');
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={company?.logo_url} alt={company?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {company?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {isLoading ? 'Carregando...' : company?.name || 'CRM System'}
                </h1>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}

            {isSaasAdmin && (
              <>
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500 px-3 pb-2">Administração SaaS</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={handleAdminSaasClick}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin SaaS
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
