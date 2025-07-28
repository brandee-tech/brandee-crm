import { format } from 'date-fns';

/**
 * Converte uma data para o formato YYYY-MM-DD sem conversão de timezone
 * Garante que a data exibida seja exatamente a data selecionada
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Cria uma data local a partir de uma string no formato YYYY-MM-DD
 * Evita problemas de timezone ao criar o objeto Date
 */
export const parseDateFromLocal = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Verifica se duas datas são do mesmo dia (sem considerar horário)
 */
export const isSameLocalDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseDateFromLocal(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDateFromLocal(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Compara uma data em string (YYYY-MM-DD) com uma Date object
 * Útil para filtrar eventos por data no calendário
 * CORRIGIDO: trata timezone corretamente evitando conversões UTC
 */
export const compareLocalDateString = (dateString: string, date: Date): boolean => {
  // Criar uma data local a partir da string para garantir comparação correta
  const eventDate = parseDateFromLocal(dateString);
  return isSameLocalDay(eventDate, date);
};

/**
 * Converte horário no formato HH:mm para o formato time input
 */
export const formatTimeForInput = (timeString?: string): string => {
  if (!timeString) return '';
  return timeString.slice(0, 5); // Garante formato HH:MM
};

/**
 * Combina data e horário em um único objeto Date
 */
export const combineDateAndTime = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};