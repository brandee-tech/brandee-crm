import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatPhoneForWhatsApp, isValidPhoneForWhatsApp } from '@/lib/phone-utils';

interface WhatsAppLeadButtonProps {
  phone: string;
  leadName: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const WhatsAppLeadButton = ({ phone, leadName, size = 'sm' }: WhatsAppLeadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Olá ${leadName}`);

  if (!isValidPhoneForWhatsApp(phone)) {
    return null;
  }

  const handleSendToWhatsApp = () => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className="h-auto p-1 text-green-600 hover:text-green-700 hover:bg-green-50"
          title={`Enviar mensagem para ${leadName} no WhatsApp`}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar mensagem WhatsApp</DialogTitle>
          <DialogDescription>
            Personalize a mensagem que será enviada para <strong>{leadName}</strong> no WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendToWhatsApp} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Enviar no WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};