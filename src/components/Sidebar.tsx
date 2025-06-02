
import { 
  Home, 
  Users, 
  UserPlus, 
  Building2, 
  CheckSquare, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  Kanban
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'contacts', label: 'Contatos', icon: Users },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'scripts', label: 'Scripts', icon: FileText },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
];

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} relative flex flex-col`}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">CRM Pro</h1>
              <p className="text-sm text-slate-400">Sistema de Vendas</p>
            </div>
          )}
        </div>
      </div>

      <nav className="px-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Cargos</span>}
        </button>

        {!isCollapsed && user && (
          <div className="px-4 py-2 text-sm text-slate-400 border-t border-slate-700">
            <p className="truncate">{user.email}</p>
          </div>
        )}

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
};
