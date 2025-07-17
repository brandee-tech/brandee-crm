
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { AppointmentCard } from './appointments/AppointmentCard';
import { EmptyAppointments } from './appointments/EmptyAppointments';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppointmentFiltersComponent, AppointmentFilters } from './appointments/AppointmentFilters';
import { useAppointments } from '@/hooks/useAppointments';
import { Plus } from 'lucide-react';
import { Appointment } from '@/types/appointment';

export const Appointments = () => {
  const { appointments, loading, isUpdating } = useAppointments();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    closer: ''
  });

  const handleCreateNew = () => {
    setAddDialogOpen(true);
  };

  // Get unique closers for filter dropdown
  const closers = useMemo(() => {
    const uniqueClosers = new Map();
    appointments.forEach(appointment => {
      if (appointment.assigned_closer) {
        const id = appointment.assigned_to;
        const name = appointment.assigned_closer.full_name || appointment.assigned_closer.email || 'Sem nome';
        uniqueClosers.set(id, { id, name });
      }
    });
    return Array.from(uniqueClosers.values());
  }, [appointments]);

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment: Appointment) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const leadName = appointment.leads?.name?.toLowerCase() || '';
        const appointmentTitle = appointment.title?.toLowerCase() || '';
        const leadPhone = appointment.leads?.phone?.toLowerCase() || '';
        
        if (!leadName.includes(searchTerm) && 
            !appointmentTitle.includes(searchTerm) && 
            !leadPhone.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }

      // Closer filter
      if (filters.closer && appointment.assigned_to !== filters.closer) {
        return false;
      }

      // Date filters
      if (filters.dateFrom && appointment.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && appointment.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [appointments, filters]);

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

      {/* Filters */}
      <AppointmentFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        closers={closers}
        resultsCount={filteredAppointments.length}
      />

      {/* Grid de Cards - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
          />
        ))}

        {/* Empty State */}
        {filteredAppointments.length === 0 && appointments.length > 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Nenhum agendamento encontrado com os filtros aplicados.</p>
          </div>
        )}

        {appointments.length === 0 && !loading && (
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
