
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { AppointmentCard } from './appointments/AppointmentCard';
import { EmptyAppointments } from './appointments/EmptyAppointments';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useAppointments } from '@/hooks/useAppointments';
import { Plus } from 'lucide-react';

export const Appointments = () => {
  const { appointments, loading, isUpdating } = useAppointments();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleCreateNew = () => {
    setAddDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <LoadingIndicator className="py-16" text="Carregando agendamentos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Agendamentos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie reuniões e compromissos com leads
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button
            onClick={handleCreateNew}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Grid de Cards - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
          />
        ))}

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="col-span-full">
            <EmptyAppointments onCreateNew={handleCreateNew} />
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddAppointmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
};
