
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Clock, User, Building, Edit2, Trash2, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: number;
  lead_id: string | null;
  contact_id: string | null;
  scheduled_by: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  leads?: {
    name: string;
    company: string | null;
  };
  contacts?: {
    name: string;
    company_id: string | null;
  };
}

export const Appointments = () => {
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // Remove seconds
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      case 'Realizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie reuniões e compromissos com leads</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{appointment.title}</h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEdit(appointment)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(appointment.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {appointment.description && (
              <p className="text-gray-600 text-sm mb-4">{appointment.description}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formatTime(appointment.time)} ({appointment.duration} min)</span>
              </div>

              {appointment.leads && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{appointment.leads.name}</span>
                </div>
              )}

              {appointment.leads?.company && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>{appointment.leads.company}</span>
                </div>
              )}

              {appointment.contacts && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{appointment.contacts.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </Card>
        ))}

        {appointments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
            <p className="text-gray-500 mb-4">Comece criando seu primeiro agendamento</p>
            <Button onClick={() => setAddDialogOpen(true)}>
              Criar Agendamento
            </Button>
          </div>
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
