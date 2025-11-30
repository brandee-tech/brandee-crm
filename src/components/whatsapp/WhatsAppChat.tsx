import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ChatMessages } from './ChatMessages';
import { WhatsAppSettings } from './WhatsAppSettings';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useWhatsAppInstance } from '@/hooks/useWhatsAppInstance';
import { useWhatsAppConversations } from '@/hooks/useWhatsAppConversations';
import { useRealtimeWhatsApp } from '@/hooks/useRealtimeWhatsApp';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WhatsAppChat = () => {
  const { company } = useCurrentCompany();
  const { instance } = useWhatsAppInstance(company?.id);
  const { conversations } = useWhatsAppConversations(company?.id);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useRealtimeWhatsApp(company?.id);

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!instance || instance.status === 'disconnected') {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-3xl font-bold mb-2">WhatsApp Chat</h1>
            <p className="text-muted-foreground">
              Conecte uma instância do WhatsApp para começar
            </p>
          </div>
          <WhatsAppSettings companyId={company.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-background overflow-hidden">
      {/* Lista de conversas */}
      <div className="w-full md:w-96 border-r border-border flex flex-col min-h-0 bg-background">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Conversas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            Configurações
          </Button>
        </div>

        {showSettings ? (
          <div className="flex-1 overflow-auto p-4">
            <WhatsAppSettings companyId={company.id} />
          </div>
        ) : (
          <ConversationList
            conversations={conversations || []}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        )}
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        {selectedConversation ? (
          <ChatMessages
            conversation={selectedConversation}
            instanceName={instance.instance_name}
            onConversationDeleted={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Selecione uma conversa para começar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
