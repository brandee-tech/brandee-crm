import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
interface RealtimeBadgeProps {
  isUpdating: boolean;
  className?: string;
}
export const RealtimeBadge = ({
  isUpdating,
  className
}: RealtimeBadgeProps) => {
  return (
    <Badge 
      variant={isUpdating ? "default" : "secondary"} 
      className={cn("flex items-center gap-1", className)}
    >
      {isUpdating ? (
        <>
          <Wifi className="w-3 h-3" />
          <span className="text-xs">Sincronizando...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="text-xs">Atualizado</span>
        </>
      )}
    </Badge>
  );
};