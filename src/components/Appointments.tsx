
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { AppointmentCard } from './appointments/AppointmentCard';
import { EmptyAppointments } from './appointments/EmptyAppointments';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { AppointmentFiltersComponent, AppointmentFilters } from './appointments/AppointmentFilters';
import { useAppointments } from '@/hooks/useAppointments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Plus, Building2 } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { Card, CardContent } from '@/components/ui/card';
import { PermissionGuard } from '@/components/PermissionGuard';

export const Appointments = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const { appointments, loading, isUpdating } = useAppointments();
  const { userInfo } = useCurrentUser();
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

  // Verificação defensiva: se não há empresa configurada, mostrar tela específica
  if (!loading && userInfo && !userInfo.has_company) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto pt-16">
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configure sua empresa
              </h2>
              <p className="text-gray-600 mb-6">
                Para acessar os agendamentos, você precisa primeiro configurar sua empresa.
              </p>
              <Button onClick={() => setActiveTab?.('company-registration')}>
                Configurar Empresa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get unique closers for filter dropdown com verificação defensiva
  const closers = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    
    try {
      const uniqueClosers = new Map();
      appointments.forEach(appointment => {
        if (appointment?.assigned_closer && appointment?.assigned_to) {
          const id = appointment.assigned_to;
          const name = appointment.assigned_closer.full_name || appointment.assigned_closer.email || 'Sem nome';
          uniqueClosers.set(id, { id, name });
        }
      });
      return Array.from(uniqueClosers.values());
    } catch (error) {
      console.error('Erro ao processar closers:', error);
      return [];
    }
  }, [appointments]);

  // Filter appointments based on current filters com verificação defensiva
  const filteredAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    
    try {
      return appointments.filter((appointment: Appointment) => {
        if (!appointment) return false;
        
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
    } catch (error) {
      console.error('Erro ao filtrar agendamentos:', error);
      return appointments || [];
    }
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
          <PermissionGuard module="appointments" action="create">
            <Button
              onClick={handleCreateNew}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </PermissionGuard>
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
