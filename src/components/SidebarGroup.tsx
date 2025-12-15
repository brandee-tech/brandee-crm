import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
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
  const hasActiveItem = items.some(item => item.id === activeTab);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Filtrar itens visíveis baseado em permissões
  const visibleItems = items.filter(
    item => !item.permission || canAccess(item.permission)
  );

  if (visibleItems.length === 0) return null;

  return (
    <Tooltip>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveItem ? "default" : "ghost"}
              className={cn(
                "w-full flex items-center justify-center h-12 transition-all duration-200",
                hasActiveItem && "bg-primary text-primary-foreground shadow-md",
                !hasActiveItem && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <GroupIcon className={cn("h-5 w-5", hasActiveItem && "scale-110")} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
        <PopoverContent 
          side="right" 
          align="start" 
          className="w-48 p-2 bg-popover border border-border shadow-lg"
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
    </Tooltip>
  );
};
