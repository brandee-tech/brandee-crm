
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LogOut } from "lucide-react";

export const TopBar = () => {
  const { signOut } = useAuth();
  const { userInfo, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="h-[88px] bg-white border-b shadow-sm flex items-center justify-end px-6">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const displayName = userInfo?.full_name || userInfo?.email || "Usuário";
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-[88px] bg-white border-b shadow-sm flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userInfo?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={signOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
