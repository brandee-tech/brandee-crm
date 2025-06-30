
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RealtimeBadgeProps {
  isUpdating: boolean;
  className?: string;
}

export const RealtimeBadge = ({ isUpdating, className }: RealtimeBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "transition-all duration-300",
        isUpdating 
          ? "bg-green-50 text-green-700 border-green-200 animate-pulse" 
          : "bg-blue-50 text-blue-700 border-blue-200",
        className
      )}
    >
      {isUpdating ? (
        <>
          <Wifi className="w-3 h-3 mr-1 animate-bounce" />
          Sincronizando...
        </>
      ) : (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </>
      )}
    </Badge>
  );
};
