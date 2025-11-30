
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useSaasAdmin } from "@/hooks/useSaasAdmin";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { company, loading } = useCurrentCompany();
  const { isSaasAdmin } = useSaasAdmin();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
    { id: 'leads', label: 'Leads', icon: UserPlus, permission: 'leads' },
    { id: 'leadsPipeline', label: 'Pipeline de Leads', icon: Kanban, permission: 'leads' },
    { id: 'leadTags', label: 'Tags de Leads', icon: Tag, permission: 'leads' },
    { id: 'products', label: 'Produtos', icon: Package, permission: 'products' },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, permission: 'appointments' },
    { id: 'meetings', label: 'Reuniões', icon: Video, permission: 'meetings' },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays, permission: 'appointments' },
    { id: 'scheduleBlocks', label: 'Gerenciar Horários', icon: Clock, permission: 'scheduleBlocks' },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, permission: 'tasks' },
    { id: 'scripts', label: 'Materiais', icon: FileText, permission: 'scripts' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, permission: 'reports' },
    { id: 'partners', label: 'Parceiros', icon: Handshake, permission: 'partners' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, permission: null, route: '/whatsapp' },
    { id: 'users', label: 'Usuários', icon: Users, permission: 'user-management' },
    { id: 'settings', label: 'Configurações', icon: Settings, permission: 'settings' },
  ];

  const handleAdminSaasClick = () => {
    console.log('Sidebar: Navigating to admin panel using React Router');
    navigate('/admin');
  };

  return (
    <div className="hidden md:flex w-64 bg-white shadow-lg border-r flex-col">
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
              {loading ? 'Carregando...' : company?.name || 'CRM System'}
            </h1>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Se o item tem permissão e o usuário não tem acesso, não mostrar
          if (item.permission && !canAccess(item.permission)) {
            return null;
          }
          
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else {
                  setActiveTab(item.id);
                }
              }}
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
  );
};
