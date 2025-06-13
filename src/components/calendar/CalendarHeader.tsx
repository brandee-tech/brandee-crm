
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday
}: CalendarHeaderProps) => {
  const getDateTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        return format(currentDate, "'Semana de' d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          Calendário
        </h1>
        <p className="text-gray-600 mt-1">Visualize todos os agendamentos e reuniões</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Seletor de visualização */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className="text-xs"
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className="text-xs"
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className="text-xs"
          >
            Mês
          </Button>
        </div>

        {/* Controles de navegação */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="text-xs"
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="min-w-[180px] text-center">
            <h2 className="text-sm md:text-lg font-semibold">
              {getDateTitle()}
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
