import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useSaasAdmin } from "@/hooks/useSaasAdmin";
import { useNavigate } from "react-router-dom";
import { SidebarGroup } from "@/components/SidebarGroup";
import {
  LayoutDashboard, Users, CheckSquare, BarChart3, Settings, UserPlus,
  Kanban, FileText, Calendar, CalendarDays, Video, Shield, Package,
  Handshake, Clock, Tag, MessageCircle, LucideIcon
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuStructure = [{
  type: 'item' as const,
  id: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  permission: null,
  route: '/dashboard'
}, {
  type: 'group' as const,
  id: 'crm',
  label: 'CRM',
  icon: UserPlus,
  items: [{
    id: 'leadsPipeline',
    label: 'Leads',
    icon: Kanban,
    permission: 'leads',
    route: '/leads'
  }, {
    id: 'leadTags',
    label: 'Tags',
    icon: Tag,
    permission: 'leads',
    route: '/tags'
  }, {
    id: 'products',
    label: 'Produtos',
    icon: Package,
    permission: 'products',
    route: '/products'
  }]
}, {
  type: 'group' as const,
  id: 'agenda',
  label: 'Agenda',
  icon: CalendarDays,
  items: [{
    id: 'appointments',
    label: 'Agendamentos',
    icon: Calendar,
    permission: 'appointments',
    route: '/appointments'
  }, {
    id: 'meetings',
    label: 'Reuniões',
    icon: Video,
    permission: 'meetings',
    route: '/meetings'
  }, {
    id: 'calendar',
    label: 'Calendário',
    icon: CalendarDays,
    permission: 'appointments',
    route: '/calendar'
  }, {
    id: 'scheduleBlocks',
    label: 'Horários',
    icon: Clock,
    permission: 'scheduleBlocks',
    route: '/schedule'
  }]
}, {
  type: 'item' as const,
  id: 'whatsapp',
  label: 'WhatsApp',
  icon: MessageCircle,
  permission: null,
  route: '/whatsapp'
}, {
  type: 'group' as const,
  id: 'operational',
  label: 'Operacional',
  icon: CheckSquare,
  items: [{
    id: 'tasks',
    label: 'Tarefas',
    icon: CheckSquare,
    permission: 'tasks',
    route: '/tasks'
  }, {
    id: 'scripts',
    label: 'Materiais',
    icon: FileText,
    permission: 'scripts',
    route: '/scripts'
  }]
}, {
  type: 'item' as const,
  id: 'reports',
  label: 'Relatórios',
  icon: BarChart3,
  permission: 'reports',
  route: '/reports'
}, {
  type: 'item' as const,
  id: 'partners',
  label: 'Parceiros',
  icon: Handshake,
  permission: 'partners',
  route: '/partners'
}, {
  type: 'group' as const,
  id: 'admin',
  label: 'Administração',
  icon: Settings,
  items: [{
    id: 'users',
    label: 'Usuários',
    icon: Users,
    permission: 'user-management',
    route: '/users'
  }, {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    permission: null,
    route: '/settings'
  }]
}];

export const Sidebar = ({
  activeTab,
  setActiveTab,
}: SidebarProps) => {
  const { company, loading } = useCurrentCompany();
  const { isSaasAdmin } = useSaasAdmin();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="hidden md:flex bg-sidebar border-r border-sidebar-border flex-col shadow-sm w-16">
        {/* Company Header */}
        <div className="p-3 border-b border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Avatar className="w-10 h-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200 cursor-pointer">
                  <AvatarImage src={company?.logo_url} alt={company?.name} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {company?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {loading ? 'Carregando...' : company?.name || 'CRM System'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
          {menuStructure.map((item, index) => {
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

            if (item.permission && !canAccess(item.permission)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full flex items-center justify-center h-12 transition-all duration-200",
                      isActive && "bg-primary text-primary-foreground shadow-md",
                      !isActive && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "opacity-0 animate-fade-in animation-fill-both"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      if (item.route) {
                        navigate(item.route);
                      }
                    }}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* SaaS Admin Section */}
          {isSaasAdmin && (
            <div className="border-t border-sidebar-border pt-3 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center h-12 text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-primary/10 transition-colors"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Administração SaaS
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground text-center">©</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
