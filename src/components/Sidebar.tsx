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
  Handshake, Clock, Tag, MessageCircle, LucideIcon, Zap, ChevronLeft, ChevronRight
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
    id: 'leads',
    label: 'Leads',
    icon: UserPlus,
    permission: 'leads',
    route: '/leads'
  }, {
    id: 'leadsPipeline',
    label: 'Pipeline',
    icon: Kanban,
    permission: 'leads',
    route: '/pipeline'
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
  }, {
    id: 'automation',
    label: 'Automação',
    icon: Zap,
    permission: 'leads',
    route: '/automation'
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
    permission: 'settings',
    route: '/settings'
  }]
}];

export const Sidebar = ({
  activeTab,
  setActiveTab,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const { company, loading } = useCurrentCompany();
  const { isSaasAdmin } = useSaasAdmin();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "hidden md:flex bg-sidebar border-r border-sidebar-border flex-col shadow-sm relative transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-background shadow-md border hover:bg-accent"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Company Header */}
        <div className={cn(
          "border-b border-sidebar-border transition-all duration-300",
          collapsed ? "p-3" : "p-5"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}>
            <Avatar className={cn(
              "ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/30",
              collapsed ? "w-10 h-10" : "w-10 h-10"
            )}>
              <AvatarImage src={company?.logo_url} alt={company?.name} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {company?.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-sidebar-foreground truncate">
                  {loading ? 'Carregando...' : company?.name || 'CRM System'}
                </h1>
                {company?.industry && (
                  <p className="text-xs text-muted-foreground truncate">
                    {company.industry}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 overflow-y-auto scrollbar-none",
          collapsed ? "p-2" : "p-3"
        )}>
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
                  collapsed={collapsed}
                />
              );
            }

            if (item.permission && !canAccess(item.permission)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full flex flex-col items-center justify-center h-14 gap-1 px-1 transition-all duration-200",
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
                      <span className="text-[10px] leading-tight text-center truncate w-full">
                        {item.label}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start relative overflow-hidden transition-all duration-200",
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
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                    )}
                    <Icon className={cn("mr-2 h-4 w-4 transition-transform duration-200", isActive && "scale-110")} />
                    {item.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* SaaS Admin Section */}
          {isSaasAdmin && (
            <div className="border-t border-sidebar-border pt-3 mt-3">
              {!collapsed && (
                <p className="text-xs text-muted-foreground px-3 pb-2 font-medium uppercase tracking-wider">
                  Administração SaaS
                </p>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  {collapsed ? (
                    <Button 
                      variant="ghost" 
                      className="w-full flex flex-col items-center justify-center h-14 gap-1 px-1 text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-primary/10 transition-colors"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="text-[10px] leading-tight text-center truncate w-full">
                        Admin
                      </span>
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-primary/10 transition-colors"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin SaaS
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right">
                  Administração SaaS
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-sidebar-border",
          collapsed ? "p-2" : "p-3"
        )}>
          <div className={cn(
            "rounded-lg bg-muted/50",
            collapsed ? "p-2" : "px-3 py-2"
          )}>
            <p className="text-xs text-muted-foreground text-center">
              {collapsed ? "©" : "© 2024 CRM System"}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
