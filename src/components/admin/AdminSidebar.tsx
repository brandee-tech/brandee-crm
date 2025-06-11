
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Shield
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBackToCrm: () => void;
}

export const AdminSidebar = ({ activeTab, setActiveTab, onBackToCrm }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 bg-slate-900 text-white shadow-lg flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-semibold">Admin SaaS</h1>
            <p className="text-xs text-slate-400">Painel Administrativo</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-white hover:bg-slate-700",
                activeTab === item.id && "bg-slate-700 text-white"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
          onClick={onBackToCrm}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao CRM
        </Button>
      </div>
    </div>
  );
};
