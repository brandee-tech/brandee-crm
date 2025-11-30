
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

export const WhatsAppButton = () => {
  const { company, loading } = useCurrentCompany();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Não mostrar na página do WhatsApp
  if (location.pathname === '/whatsapp') {
    return null;
  }

  useEffect(() => {
    // Mostrar o botão após 2 segundos para não ser intrusivo
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Debug logs
  console.log('WhatsAppButton Debug:', {
    company,
    loading,
    whatsapp_enabled: company?.whatsapp_enabled,
    whatsapp_phone: company?.whatsapp_phone,
    isVisible
  });

  // Aguardar carregamento dos dados
  if (loading) {
    return null;
  }

  // Verificar se WhatsApp está habilitado e telefone existe (com trim para espaços)
  const phoneExists = company?.whatsapp_phone && company.whatsapp_phone.trim().length > 0;
  
  if (!company?.whatsapp_enabled || !phoneExists) {
    console.log('WhatsApp button not shown:', { 
      enabled: company?.whatsapp_enabled, 
      phoneExists,
      phone: company?.whatsapp_phone 
    });
    return null;
  }

  const handleWhatsAppClick = () => {
    const phone = company.whatsapp_phone.replace(/\D/g, ''); // Remove caracteres não numéricos
    const message = encodeURIComponent(company.whatsapp_message || 'Olá! Preciso de ajuda.');
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
      <button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Falar no WhatsApp"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Precisa de ajuda? Fale conosco!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
};
