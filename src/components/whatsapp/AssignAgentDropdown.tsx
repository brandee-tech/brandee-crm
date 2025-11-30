import { User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfiles } from '@/hooks/useProfiles';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AssignAgentDropdownProps {
  conversationId: string;
  currentAgentId?: string | null;
  companyId: string;
}

export const AssignAgentDropdown = ({
  conversationId,
  currentAgentId,
  companyId,
}: AssignAgentDropdownProps) => {
  const { profiles } = useProfiles();
  const { userInfo } = useCurrentUser();
  const { assignAgent } = useWhatsAppConversations(companyId);

  const currentAgent = currentAgentId
    ? profiles.find((p) => p.id === currentAgentId)
    : null;

  const handleAssign = (agentId: string | null) => {
    assignAgent.mutate({ conversationId, agentId });
  };

  const isCurrentUser = currentAgentId === userInfo?.user_id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {currentAgent ? (
            <>
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {currentAgent.full_name?.substring(0, 2).toUpperCase() || 'NN'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {isCurrentUser ? 'Você' : currentAgent.full_name || 'Atendente'}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span className="text-xs">Atribuir</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background z-50">
        <DropdownMenuItem
          onClick={() => handleAssign(userInfo?.user_id || null)}
          className="cursor-pointer"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          <span>Assumir atendimento</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {profiles.map((profile) => {
          const isSelected = profile.id === currentAgentId;
          return (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleAssign(profile.id)}
              className="cursor-pointer"
            >
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback className="text-xs bg-muted">
                  {profile.full_name?.substring(0, 2).toUpperCase() || 'NN'}
                </AvatarFallback>
              </Avatar>
              <span className={isSelected ? 'font-semibold' : ''}>
                {profile.full_name || profile.email || 'Sem nome'}
              </span>
              {isSelected && <UserCheck className="w-4 h-4 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAssign(null)}
          className="cursor-pointer text-muted-foreground"
        >
          <User className="w-4 h-4 mr-2" />
          <span>Remover atribuição</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
