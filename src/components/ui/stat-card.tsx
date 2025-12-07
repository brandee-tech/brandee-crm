import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { AnimatedCounter } from "./animated-counter";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  className?: string;
  index?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    trend: 'text-muted-foreground'
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-primary'
  },
  success: {
    icon: 'bg-success/10 text-success',
    trend: 'text-success'
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    trend: 'text-warning'
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    trend: 'text-destructive'
  },
  info: {
    icon: 'bg-info/10 text-info',
    trend: 'text-info'
  }
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
  index = 0,
  prefix = '',
  suffix = '',
  decimals = 0
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isNumericValue = typeof value === 'number';

  return (
    <Card 
      className={cn(
        "hover-lift group overflow-hidden relative opacity-0 animate-fade-in-up animation-fill-both",
        className
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
          styles.icon
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="text-2xl font-bold text-foreground mb-1">
          {isNumericValue ? (
            <AnimatedCounter 
              value={value} 
              prefix={prefix} 
              suffix={suffix}
              decimals={decimals}
            />
          ) : (
            value
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          {description && (
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive !== false ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive !== false ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              {trend.label && (
                <span className="text-muted-foreground font-normal">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
