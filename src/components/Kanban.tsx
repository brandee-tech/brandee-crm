import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, User, Eye, Edit, Trash2 } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { RealtimeBadge } from '@/components/ui/realtime-badge';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { EditAppointmentKanbanDialog } from '@/components/EditAppointmentKanbanDialog';
import { ViewAppointmentDialog } from '@/components/ViewAppointmentDialog';
import { PipelineStatusIndicator } from '@/components/PipelineStatusIndicator';
import { PipelineColumnManager } from '@/components/PipelineColumnManager';
import { Appointment } from '@/types/appointment';
import { TagBadge } from '@/components/TagBadge';
import { WhatsAppLeadButton } from '@/components/WhatsAppLeadButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
export const Kanban = () => {
  const {
    appointments,
    updateAppointmentOptimistic,
    deleteAppointment,
    loading,
    isUpdating
  } = useAppointments();
  const {
    columns
  } = usePipelineColumns();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [dragLoading, setDragLoading] = useState<string | null>(null);

  // Group appointments by status (column)
  const appointmentsByStatus = appointments.reduce((acc, appointment) => {
    const status = appointment.status || 'Agendado';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const appointmentId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const sourceStatus = result.source.droppableId;

    // Se não mudou de status, não fazer nada
    if (sourceStatus === newStatus) return;
    setDragLoading(appointmentId);
    try {
      console.log(`Movendo agendamento ${appointmentId} de ${sourceStatus} para ${newStatus}`);

      // Usar atualização otimística para feedback imediato
      await updateAppointmentOptimistic(appointmentId, {
        status: newStatus
      });
      console.log('Agendamento movido com sucesso');
    } catch (error) {
      console.error('Erro ao mover agendamento:', error);
      // O rollback já é tratado na função updateAppointmentOptimistic
    } finally {
      setDragLoading(null);
    }
  };
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };
  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };
  const handleDelete = async (appointment: Appointment) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteAppointment(appointment.id);
    }
  };
  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR
      });
    } catch {
      return `${date} às ${time}`;
    }
  };
  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando pipeline...</div>
      </div>;
  }
  return <div className="p-8 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie agendamentos por status</p>
        </div>
        <div className="flex items-center gap-4">
          <RealtimeBadge isUpdating={isUpdating} />
          <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowColumnManager(!showColumnManager)}>
            Gerenciar Colunas
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
          </div>
        </div>
      </div>

      <PipelineStatusIndicator />

      {showColumnManager && <PipelineColumnManager />}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => <div key={column.id} className="flex-1 min-w-[300px] max-w-[350px] space-y-4">
              <Card className="shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: column.color
                }} />
                    {column.name}
                    <Badge variant="secondary" className="ml-auto">
                      {appointmentsByStatus[column.name]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Droppable droppableId={column.name}>
                {(provided, snapshot) => <div {...provided.droppableProps} ref={provided.innerRef} className={`h-[calc(100vh-350px)] overflow-y-auto space-y-3 p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}>
                    {(appointmentsByStatus[column.name] || []).map((appointment, index) => <Draggable key={appointment.id} draggableId={appointment.id} index={index} isDragDisabled={dragLoading === appointment.id}>
                        {(provided, snapshot) => <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`cursor-move transition-all duration-200 shrink-0 ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : 'hover:shadow-md'} ${dragLoading === appointment.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-sm line-clamp-2">
                                    {appointment.title}
                                  </h3>
                                  <div className="flex gap-1 ml-2">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => {
                            e.stopPropagation();
                            handleView(appointment);
                          }}>
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => {
                            e.stopPropagation();
                            handleEdit(appointment);
                          }}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700" onClick={e => {
                            e.stopPropagation();
                            handleDelete(appointment);
                          }}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {formatDateTime(appointment.date, appointment.time)}
                                  </div>
                                  
                                  

                                  {appointment.assigned_closer && <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      {appointment.assigned_closer.full_name}
                                    </div>}

                                   {appointment.leads && <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span>Lead: {appointment.leads.name}</span>
                                        {appointment.leads.phone && <WhatsAppLeadButton phone={appointment.leads.phone} leadName={appointment.leads.name} size="sm" />}
                                      </div>}
                                 </div>

                                 {/* Tags do Lead */}
                                 {appointment.leads?.tags && appointment.leads.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                                     {appointment.leads.tags.map(tag => <TagBadge key={tag.id} name={tag.name} color={tag.color} size="sm" />)}
                                   </div>}

                                {appointment.description}

                                {dragLoading === appointment.id && <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Movendo...
                                  </div>}
                              </div>
                            </CardContent>
                          </Card>}
                      </Draggable>)}
                    {provided.placeholder}
                  </div>}
              </Droppable>
            </div>)}
        </div>
      </DragDropContext>

      <AddAppointmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditAppointmentKanbanDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} appointment={selectedAppointment} />

      <ViewAppointmentDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} appointment={selectedAppointment} />
    </div>;
};