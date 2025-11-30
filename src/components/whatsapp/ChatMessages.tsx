import { useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { WhatsAppConversation } from '@/types/whatsapp';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ChatMessagesProps {
  conversation: WhatsAppConversation;
  instanceName: string;
}

export const ChatMessages = ({ conversation, instanceName }: ChatMessagesProps) => {
  const { messages } = useWhatsAppMessages(conversation.id, instanceName);
  const { markAsRead } = useWhatsAppConversations(conversation.company_id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const contactName = conversation.contact?.name || conversation.contact?.phone || 'Desconhecido';
  const initials = contactName.substring(0, 2).toUpperCase();

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
      <div className="p-4 border-b border-border flex items-center justify-between bg-background">
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages?.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput
        conversation={conversation}
        instanceName={instanceName}
      />
    </div>
  );
};
