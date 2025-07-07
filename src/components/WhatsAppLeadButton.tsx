import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPhoneForWhatsApp, isValidPhoneForWhatsApp } from '@/lib/phone-utils';

interface WhatsAppLeadButtonProps {
  phone: string;
  leadName: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const WhatsAppLeadButton = ({ phone, leadName, size = 'sm' }: WhatsAppLeadButtonProps) => {
  if (!isValidPhoneForWhatsApp(phone)) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const message = encodeURIComponent(`Olá ${leadName}! Vi seu contato em nossa base de leads. Como posso ajudá-lo?`);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleWhatsAppClick}
      className="h-auto p-1 text-green-600 hover:text-green-700 hover:bg-green-50"
      title={`Enviar mensagem para ${leadName} no WhatsApp`}
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
};