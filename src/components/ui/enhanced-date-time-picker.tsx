import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EnhancedDateTimePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const EnhancedDateTimePicker = ({
  selected,
  onSelect,
  showTime = false,
  placeholder = "Selecionar data",
  className,
  disabled = false
}: EnhancedDateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [selectedTime, setSelectedTime] = useState(
    selected ? format(selected, 'HH:mm') : '09:00'
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Preencher dias para completar a grade (6 semanas)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateSelect = (date: Date) => {
    if (showTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onSelect(newDate);
    } else {
      // Para garantir que a data seja exatamente como selecionada, sem conversão de timezone
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      onSelect(localDate);
    }
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selected) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selected);
      newDate.setHours(hours, minutes, 0, 0);
      onSelect(newDate);
    }
  };

  const formatDisplayValue = () => {
    if (!selected) return placeholder;
    
    if (showTime) {
      return format(selected, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
    }
    return format(selected, "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[200px]",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <div className="p-4">
          {/* Header do calendário */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="font-semibold text-sm">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {allDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selected && isSameDay(day, selected);
              const isCurrentDay = isToday(day);

              return (
                <Button
                  key={day.toISOString()}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 font-normal",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isCurrentDay && !isSelected && "bg-accent text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {format(day, 'd')}
                </Button>
              );
            })}
          </div>

          {/* Seletor de horário */}
          {showTime && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                <Label className="text-sm font-medium">Horário</Label>
              </div>
              
              <div className="space-y-3">
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full"
                />
                
                <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleTimeChange(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setIsOpen(false)} size="sm">
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};