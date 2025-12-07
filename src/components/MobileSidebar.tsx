
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useSaasAdmin } from '@/hooks/useSaasAdmin';
import { useNavigate } from 'react-router-dom';
import { SidebarGroup } from '@/components/SidebarGroup';
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
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

interface MobileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Mesma estrutura hierárquica do Sidebar.tsx
const menuStructure = [
  {
    type: 'item' as const,
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: null,
    route: '/dashboard',
  },
  {
    type: 'group' as const,
    id: 'crm',
    label: 'CRM',
    icon: UserPlus,
    items: [
      { id: 'leads', label: 'Leads', icon: UserPlus, permission: 'leads', route: '/leads' },
      { id: 'leadsPipeline', label: 'Pipeline', icon: Kanban, permission: 'leads', route: '/pipeline' },
      { id: 'leadTags', label: 'Tags', icon: Tag, permission: 'leads', route: '/tags' },
      { id: 'products', label: 'Produtos', icon: Package, permission: 'products', route: '/products' },
    ],
  },
  {
    type: 'group' as const,
    id: 'agenda',
    label: 'Agenda',
    icon: CalendarDays,
    items: [
      { id: 'appointments', label: 'Agendamentos', icon: Calendar, permission: 'appointments', route: '/appointments' },
      { id: 'meetings', label: 'Reuniões', icon: Video, permission: 'meetings', route: '/meetings' },
      { id: 'calendar', label: 'Calendário', icon: CalendarDays, permission: 'appointments', route: '/calendar' },
      { id: 'scheduleBlocks', label: 'Horários', icon: Clock, permission: 'scheduleBlocks', route: '/schedule' },
    ],
  },
  {
    type: 'item' as const,
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    permission: null,
    route: '/whatsapp',
  },
  {
    type: 'group' as const,
    id: 'operational',
    label: 'Operacional',
    icon: CheckSquare,
    items: [
      { id: 'tasks', label: 'Tarefas', icon: CheckSquare, permission: 'tasks', route: '/tasks' },
      { id: 'scripts', label: 'Materiais', icon: FileText, permission: 'scripts', route: '/scripts' },
    ],
  },
  {
    type: 'item' as const,
    id: 'reports',
    label: 'Relatórios',
    icon: BarChart3,
    permission: 'reports',
    route: '/reports',
  },
  {
    type: 'item' as const,
    id: 'partners',
    label: 'Parceiros',
    icon: Handshake,
    permission: 'partners',
    route: '/partners',
  },
  {
    type: 'group' as const,
    id: 'admin',
    label: 'Administração',
    icon: Settings,
    items: [
      { id: 'users', label: 'Usuários', icon: Users, permission: 'user-management', route: '/users' },
      { id: 'settings', label: 'Configurações', icon: Settings, permission: 'settings', route: '/settings' },
    ],
  },
];

export const MobileSidebar = ({ activeTab, setActiveTab }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { company, isLoading } = useCompanySettings();
  const { isSaasAdmin } = useSaasAdmin();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
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
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {isLoading ? 'Carregando...' : company?.name || 'CRM System'}
                </h1>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuStructure.map((item) => {
              if (item.type === 'group') {
                return (
                  <SidebarGroup
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    items={item.items}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    canAccess={canAccess}
                    onNavigate={handleNavigate}
                  />
                );
              }

              // Item único
              if (item.permission && !canAccess(item.permission)) {
                return null;
              }

              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleNavigate(item.route)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}

            {isSaasAdmin && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground px-3 pb-2">Administração SaaS</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleNavigate('/admin')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin SaaS
                </Button>
              </div>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
