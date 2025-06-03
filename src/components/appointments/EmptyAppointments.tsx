
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface EmptyAppointmentsProps {
  onCreateNew: () => void;
}

export const EmptyAppointments = ({ onCreateNew }: EmptyAppointmentsProps) => {
  return (
    <div className="col-span-full text-center py-12">
      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
      <p className="text-gray-500 mb-4">Comece criando seu primeiro agendamento</p>
      <Button onClick={onCreateNew}>
        Criar Agendamento
      </Button>
    </div>
  );
};
