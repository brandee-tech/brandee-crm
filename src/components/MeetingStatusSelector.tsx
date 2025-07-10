
import { Meeting } from '@/types/meeting';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MeetingStatusSelectorProps {
  meeting: Meeting;
  onStatusChange: (status: Meeting['status']) => void;
  disabled?: boolean;
}

export const MeetingStatusSelector = ({
  meeting,
  onStatusChange,
  disabled = false,
}: MeetingStatusSelectorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-500';
      case 'Finalizada':
        return 'bg-gray-500';
      case 'Cancelada':
        return 'bg-red-500';
      case 'Reagendada':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const statusOptions = [
    { value: 'Agendada', label: 'Agendada' },
    { value: 'Finalizada', label: 'Finalizada' },
    { value: 'Cancelada', label: 'Cancelada' },
    { value: 'Reagendada', label: 'Reagendada' },
  ] as const;

  return (
    <div className="flex items-center gap-3">
      <Badge className={getStatusColor(meeting.status)}>
        {meeting.status}
      </Badge>
      
      <Select
        value={meeting.status}
        onValueChange={onStatusChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Alterar status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
