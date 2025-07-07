/**
 * Formata número de telefone para uso no WhatsApp
 * Adiciona código do país (55) se não existir para números brasileiros
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const numbersOnly = phone.replace(/\D/g, '');
  
  // Se já tem 55 no início e pelo menos 12 dígitos, retorna como está
  if (numbersOnly.startsWith('55') && numbersOnly.length >= 12) {
    return numbersOnly;
  }
  
  // Se tem 11 dígitos (celular brasileiro), adiciona 55
  if (numbersOnly.length === 11) {
    return `55${numbersOnly}`;
  }
  
  // Se tem 10 dígitos (fixo brasileiro), adiciona 55
  if (numbersOnly.length === 10) {
    return `55${numbersOnly}`;
  }
  
  // Para outros casos, tenta adicionar 55 se não tem código de país
  if (numbersOnly.length >= 8 && numbersOnly.length <= 11) {
    return `55${numbersOnly}`;
  }
  
  // Retorna como está se não conseguiu processar
  return numbersOnly;
};

/**
 * Verifica se um telefone é válido para WhatsApp
 */
export const isValidPhoneForWhatsApp = (phone: string): boolean => {
  if (!phone) return false;
  
  const formatted = formatPhoneForWhatsApp(phone);
  return formatted.length >= 10;
};