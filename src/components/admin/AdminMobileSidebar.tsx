
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Shield, ArrowLeft } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMobileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBackToCrm: () => void;
}

export const AdminMobileSidebar = ({ activeTab, setActiveTab, onBackToCrm }: AdminMobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleItemClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-white border-slate-700">
        <div className="flex flex-col h-full">
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
                  onClick={() => handleItemClick(item.id)}
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
              onClick={() => {
                onBackToCrm();
                setIsOpen(false);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao CRM
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
