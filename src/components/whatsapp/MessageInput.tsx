import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppConversation } from '@/types/whatsapp';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';

interface MessageInputProps {
  conversation: WhatsAppConversation;
  instanceName: string;
}

export const MessageInput = ({ conversation, instanceName }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useWhatsAppMessages(conversation.id, instanceName);

  const handleSend = () => {
    if (!message.trim()) return;

    const phone = conversation.contact?.whatsapp_id || '';

    sendMessage.mutate(
      {
        number: phone,
        text: message,
        companyId: conversation.company_id,
      },
      {
        onSuccess: () => {
          setMessage('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Smile className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          placeholder="Digite uma mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
          className="shrink-0 bg-green-600 hover:bg-green-700"
          size="icon"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
