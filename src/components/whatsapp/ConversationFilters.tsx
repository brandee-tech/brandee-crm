import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConversation } from '@/types/whatsapp';

export type ConversationFilterType = 'all' | 'mine' | 'unassigned';

interface ConversationFiltersProps {
  currentFilter: ConversationFilterType;
  onFilterChange: (filter: ConversationFilterType) => void;
  conversations: WhatsAppConversation[];
  currentUserId?: string;
}

export const ConversationFilters = ({
  currentFilter,
  onFilterChange,
  conversations,
  currentUserId,
}: ConversationFiltersProps) => {
  const myConversationsCount = conversations.filter(
    (c) => c.assigned_to === currentUserId
  ).length;

  const unassignedCount = conversations.filter(
    (c) => !c.assigned_to
  ).length;

  return (
    <div className="flex-shrink-0 px-4 py-3 border-b border-border">
      <Tabs value={currentFilter} onValueChange={(v) => onFilterChange(v as ConversationFilterType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs gap-1">
            Todas
            <Badge variant="secondary" className="ml-1 text-xs">
              {conversations.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mine" className="text-xs gap-1">
            Minhas
            <Badge variant="secondary" className="ml-1 text-xs">
              {myConversationsCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="text-xs gap-1">
            Sem atribuição
            <Badge variant="secondary" className="ml-1 text-xs">
              {unassignedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
