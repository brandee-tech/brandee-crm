
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { AppointmentCard } from './appointments/AppointmentCard';
import { EmptyAppointments } from './appointments/EmptyAppointments';
import { Appointment } from '@/types/appointment';

export const Appointments = () => {
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
  };

  const handleCreateNew = () => {
    setAddDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex justify-between items-center px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie reuniões e compromissos com leads</p>
        </div>
        <Button onClick={handleCreateNew}>
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        {appointments.length === 0 && (
          <EmptyAppointments onCreateNew={handleCreateNew} />
        )}
      </div>

      <AddAppointmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
};
