import { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Link2, UserPlus, X, ExternalLink } from 'lucide-react';
import { WhatsAppConversation } from '@/types/whatsapp';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { LinkContactToLeadDialog } from './LinkContactToLeadDialog';
import { CreateLeadFromWhatsAppDialog } from './CreateLeadFromWhatsAppDialog';
import { useWhatsAppLeadLink } from '@/hooks/useWhatsAppLeadLink';
import { useLeads } from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TagSelector } from '@/components/TagSelector';
import { useWhatsAppConversationTags } from '@/hooks/useWhatsAppConversationTags';

interface ChatMessagesProps {
  conversation: WhatsAppConversation;
  instanceName: string;
}

export const ChatMessages = ({ conversation, instanceName }: ChatMessagesProps) => {
  const { messages } = useWhatsAppMessages(conversation.id, instanceName);
  const { markAsRead } = useWhatsAppConversations(conversation.company_id);
  const { unlinkContactFromLead } = useWhatsAppLeadLink();
  const { leads } = useLeads();
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [createLeadDialogOpen, setCreateLeadDialogOpen] = useState(false);

  const { assignedTags, assignTag, removeTag } = useWhatsAppConversationTags(conversation.id);

  const contactName = conversation.contact?.name || conversation.contact?.phone || 'Desconhecido';
  const initials = contactName.substring(0, 2).toUpperCase();

  // Buscar informações do lead vinculado
  const linkedLead = conversation.contact?.lead_id
    ? leads.find(l => l.id === conversation.contact?.lead_id)
    : null;

  const handleUnlinkLead = async () => {
    if (conversation.contact?.id) {
      await unlinkContactFromLead.mutateAsync(conversation.contact.id);
    }
  };

  const handleViewLead = () => {
    if (linkedLead?.id) {
      navigate(`/?lead=${linkedLead.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Novo Lead': 'bg-gray-100 text-gray-700',
      'Atendimento': 'bg-blue-100 text-blue-700',
      'Agendamento': 'bg-orange-100 text-orange-700',
      'Vendido': 'bg-green-100 text-green-700',
      'Perdido': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversation.unread_count > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation.id, conversation.unread_count]);

  // Listener específico para mensagens desta conversa
  useEffect(() => {
    console.log('[ChatMessages] Setting up realtime for conversation:', conversation.id);
    
    const channel = supabase
      .channel(`chat-messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        (payload) => {
          const record = payload.new || payload.old;
          if ((record as any)?.conversation_id === conversation.id) {
            console.log('[ChatMessages] Message change detected:', payload.eventType);
            queryClient.invalidateQueries({ 
              queryKey: ['whatsapp-messages', conversation.id] 
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[ChatMessages] Subscription status:', status);
      });

    return () => {
      console.log('[ChatMessages] Cleaning up realtime for conversation:', conversation.id);
      supabase.removeChannel(channel);
    };
  }, [conversation.id, queryClient]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={conversation.contact?.profile_picture_url} />
              <AvatarFallback className="bg-green-600 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{contactName}</h3>
              <p className="text-sm text-muted-foreground">{conversation.contact?.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Lead Info or Actions */}
        {linkedLead ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{linkedLead.name}</h4>
                  <Badge className={getStatusColor(linkedLead.status || 'Novo Lead')}>
                    {linkedLead.status || 'Novo Lead'}
                  </Badge>
                </div>
                {linkedLead.product_name && (
                  <p className="text-sm text-muted-foreground">
                    Produto: {linkedLead.product_name}
                  </p>
                )}
                {linkedLead.product_value && (
                  <p className="text-sm font-medium text-green-600">
                    R$ {linkedLead.product_value.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleViewLead}
                  title="Ver lead"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUnlinkLead}
                  title="Desvincular lead"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
              className="flex-1"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Vincular a Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateLeadDialogOpen(true)}
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Lead
            </Button>
          </div>
        )}

        {/* Tags */}
        <div className="mt-3">
          <TagSelector
            selectedTags={assignedTags || []}
            onTagsChange={(tags) => {
              const currentTagIds = assignedTags?.map(t => t.id) || [];
              const newTagIds = tags.map(t => t.id);
              const added = newTagIds.filter(id => !currentTagIds.includes(id));
              const removed = currentTagIds.filter(id => !newTagIds.includes(id));

              added.forEach(tagId => {
                assignTag.mutate({ conversationId: conversation.id, tagId });
              });

              removed.forEach(tagId => {
                removeTag.mutate({ conversationId: conversation.id, tagId });
              });
            }}
            placeholder="Adicionar tags à conversa..."
          />
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto p-4" 
        ref={scrollRef}
      >
        <div className="space-y-4">
          {messages?.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
          conversation={conversation}
          instanceName={instanceName}
        />
      </div>

      {/* Dialogs */}
      {conversation.contact && (
        <>
          <LinkContactToLeadDialog
            open={linkDialogOpen}
            onOpenChange={setLinkDialogOpen}
            contactId={conversation.contact.id}
            contactName={contactName}
            contactPhone={conversation.contact.phone}
          />

          <CreateLeadFromWhatsAppDialog
            open={createLeadDialogOpen}
            onOpenChange={setCreateLeadDialogOpen}
            contactId={conversation.contact.id}
            contactName={contactName}
            contactPhone={conversation.contact.phone}
          />
        </>
      )}
    </div>
  );
};
