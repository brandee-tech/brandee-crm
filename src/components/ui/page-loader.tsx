import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PageLoader({
  text = "Carregando...",
  className,
  size = "md"
}: PageLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] animate-fade-in",
      className
    )}>
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
        
        {/* Spinner */}
        <Loader2 className={cn(
          sizeClasses[size],
          "text-primary animate-spin"
        )} />
      </div>
      
      {text && (
        <p className={cn(
          "mt-4 text-muted-foreground animate-pulse-subtle",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

interface InlineLoaderProps {
  className?: string;
}

export function InlineLoader({ className }: InlineLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

interface OverlayLoaderProps {
  visible: boolean;
  text?: string;
}

export function OverlayLoader({ visible, text }: OverlayLoaderProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <PageLoader text={text} size="lg" />
    </div>
  );
}
