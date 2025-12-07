import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  collapsed?: boolean;
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
  collapsed = false,
}: SidebarGroupProps) => {
  // Auto-expandir se contém o item ativo
  const hasActiveItem = items.some(item => item.id === activeTab);
  const [isOpen, setIsOpen] = useState(hasActiveItem || defaultOpen);
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  // Modo colapsado: usar Popover
  if (collapsed) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveItem ? "default" : "ghost"}
            className={cn(
              "w-full flex flex-col items-center justify-center h-14 gap-1 px-1 transition-all duration-200",
              hasActiveItem && "bg-primary text-primary-foreground shadow-md",
              !hasActiveItem && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <GroupIcon className={cn("h-5 w-5", hasActiveItem && "scale-110")} />
            <span className="text-[10px] leading-tight text-center truncate w-full">
              {label}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="right" 
          align="start" 
          className="w-48 p-2"
          sideOffset={8}
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
              {label}
            </p>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    if (item.route && onNavigate) {
                      onNavigate(item.route);
                    }
                    setPopoverOpen(false);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Modo expandido: usar Collapsible
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
