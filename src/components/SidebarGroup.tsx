import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  permission?: string | null;
  route?: string;
}

interface SidebarGroupProps {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  canAccess: (permission: string) => boolean;
  onNavigate?: (route: string) => void;
  defaultOpen?: boolean;
}

export const SidebarGroup = ({
  id,
  label,
  icon: GroupIcon,
  items,
  activeTab,
  setActiveTab,
  canAccess,
  onNavigate,
  defaultOpen = false,
}: SidebarGroupProps) => {
  // Auto-expandir se contém o item ativo
  const hasActiveItem = items.some(item => item.id === activeTab);
  const [isOpen, setIsOpen] = useState(hasActiveItem || defaultOpen);

  // Atualizar estado quando a aba ativa mudar
  useEffect(() => {
    if (hasActiveItem && !isOpen) {
      setIsOpen(true);
    }
  }, [activeTab, hasActiveItem, isOpen]);

  // Filtrar itens visíveis baseado em permissões
  const visibleItems = items.filter(
    item => !item.permission || canAccess(item.permission)
  );

  if (visibleItems.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between",
            hasActiveItem && "bg-primary/10 text-primary"
          )}
        >
          <span className="flex items-center">
            <GroupIcon className="mr-2 h-4 w-4" />
            {label}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-4 mt-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (item.route && onNavigate) {
                  onNavigate(item.route);
                }
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};
