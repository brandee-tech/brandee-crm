import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

export const WhatsAppButton = () => {
  const { company, loading } = useCurrentCompany();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // useEffect MUST be called before any conditional returns
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Now conditional returns can come after all hooks
  if (location.pathname === '/whatsapp') {
    return null;
  }

  if (loading) {
    return null;
  }

  const phoneExists = company?.whatsapp_phone && company.whatsapp_phone.trim().length > 0;
  
  if (!company?.whatsapp_enabled || !phoneExists) {
    return null;
  }

  if (!isVisible) return null;

  const handleWhatsAppClick = () => {
    const phone = company.whatsapp_phone!.replace(/\D/g, '');
    const message = encodeURIComponent(company.whatsapp_message || 'Olá! Preciso de ajuda.');
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
      <button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Falar no WhatsApp"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Precisa de ajuda? Fale conosco!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
};
