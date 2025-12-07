import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonCardProps {
  className?: string;
  showIcon?: boolean;
  showDescription?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showIcon = true,
  showDescription = true,
  lines = 1
}: SkeletonCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-6 animate-pulse",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        {showIcon && <Skeleton className="h-10 w-10 rounded-lg" />}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        {showDescription && <Skeleton className="h-3 w-32" />}
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

interface SkeletonListItemProps {
  className?: string;
  showAvatar?: boolean;
}

export function SkeletonListItem({
  className,
  showAvatar = true
}: SkeletonListItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg",
      className
    )}>
      {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className
}: SkeletonTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 flex-1"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
