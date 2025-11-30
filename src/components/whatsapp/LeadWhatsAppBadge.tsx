import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LeadWhatsAppBadgeProps {
  leadId: string;
  hasConversation?: boolean;
  conversationId?: string;
  lastMessageAt?: string;
}

export const LeadWhatsAppBadge = ({
  leadId,
  hasConversation = false,
  conversationId,
  lastMessageAt,
}: LeadWhatsAppBadgeProps) => {
  const navigate = useNavigate();

  const handleOpenConversation = () => {
    if (!hasConversation || !conversationId) {
      toast.error('Nenhuma conversa do WhatsApp encontrada para este lead');
      return;
    }
    
    // Navegar para WhatsApp com a conversa selecionada
    navigate(`/whatsapp?conversation=${conversationId}`);
  };

  if (!hasConversation) {
    return null;
  }

  const formatLastMessage = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleOpenConversation}
      className="h-auto p-1 hover:bg-green-50"
    >
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
        <MessageCircle className="w-3 h-3" />
        WhatsApp
        {lastMessageAt && (
          <span className="text-xs ml-1 opacity-70">
            {formatLastMessage(lastMessageAt)}
          </span>
        )}
      </Badge>
    </Button>
  );
};
