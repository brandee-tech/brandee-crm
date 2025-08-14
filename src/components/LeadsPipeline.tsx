import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, User, Eye, Edit, Trash2, Phone, BarChart3 } from 'lucide-react';
import { useLeadsPipeline } from '@/hooks/useLeadsPipeline';

import { AddLeadDialog } from '@/components/AddLeadDialog';
import { EditLeadDialog } from '@/components/EditLeadDialog';
import { useLeadDialog } from '@/contexts/LeadDialogContext';
import { PipelineStatusIndicator } from '@/components/PipelineStatusIndicator';
import { PipelineColumnManager } from '@/components/PipelineColumnManager';
import { PipelineFilters } from '@/components/PipelineFilters';
import { TagBadge } from '@/components/TagBadge';
import { WhatsAppLeadButton } from '@/components/WhatsAppLeadButton';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { ViewAppointmentDialog } from '@/components/ViewAppointmentDialog';
import { ViewLeadJourneyDialog } from '@/components/ViewLeadJourneyDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const LeadsPipeline = () => {
  console.log('🔍 LeadsPipeline component rendering');
  
  const {
    leadsByStatus,
    columns,
    loading,
    dragLoading,
    filters,
    setFilters,
    handleDragEnd,
    createLead
  } = useLeadsPipeline();

  const { state: leadDialogState, openDialog: openLeadDialog, closeDialog: closeLeadDialog } = useLeadDialog();
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState(false);
  const [addAppointmentDialogOpen, setAddAppointmentDialogOpen] = useState(false);
  const [viewAppointmentDialogOpen, setViewAppointmentDialogOpen] = useState(false);
  const [viewJourneyDialogOpen, setViewJourneyDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [appointmentLead, setAppointmentLead] = useState<any>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  
  // Debug logs importantes para o pipeline
  console.log('🔍 LeadsPipeline component state:', {
    columnsCount: columns?.length || 0,
    leadsCount: Object.keys(leadsByStatus || {}).reduce((total, status) => total + (leadsByStatus[status]?.length || 0), 0),
    loading,
    editLeadDialogOpen,
    selectedLead: selectedLead?.id || null,
    dragLoading
  });

  const handleEditLead = (lead: any) => {
    console.log('Pipeline - Handle edit lead clicked, lead:', lead);
    console.log('Current editLeadDialogOpen state:', editLeadDialogOpen);
    console.log('Current selectedLead state:', selectedLead);
    
    try {
      if (!lead) {
        console.error('Pipeline - Lead is null or undefined');
        return;
      }
      
      if (!lead.id) {
        console.error('Pipeline - Lead ID is missing');
        return;
      }
      
      setSelectedLead(lead);
      setEditLeadDialogOpen(true);
      console.log('Pipeline - Edit dialog state set to true, lead set to:', lead);
      
      // Force re-render check
      setTimeout(() => {
        console.log('Pipeline - After timeout - editLeadDialogOpen:', editLeadDialogOpen, 'selectedLead:', selectedLead);
      }, 100);
      
    } catch (error) {
      console.error('Pipeline - Error in handleEditLead:', error);
    }
  };

  const handleAppointmentAction = useCallback((lead: any) => {
    console.log('🔥 [DEBUG] handleAppointmentAction chamado com lead:', lead?.id, lead?.name);
    
    // Se o lead tem agendamentos, mostra o agendamento existente
    if (lead.appointments_count > 0 && lead.latest_appointment) {
      setSelectedLead(lead);
      setViewAppointmentDialogOpen(true);
    } else {
      // Se não tem agendamentos, abre dialog para criar novo
      console.log('🔥 [DEBUG] Definindo appointmentLead e abrindo dialog de criação');
      setAppointmentLead(lead);
      setAddAppointmentDialogOpen(true);
    }
  }, []);

  const handleViewJourney = (lead: any) => {
    setSelectedLead(lead);
    setViewJourneyDialogOpen(true);
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
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando pipeline de leads...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Leads</h1>
          <p className="text-gray-600 mt-1">Acompanhe a jornada completa dos seus leads</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowColumnManager(!showColumnManager)}
            >
              Gerenciar Colunas
            </Button>
            <Button onClick={openLeadDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      <PipelineStatusIndicator />

      <PipelineFilters filters={filters} onFiltersChange={setFilters} />

      {showColumnManager && <PipelineColumnManager />}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-1 min-w-[300px] max-w-[350px] space-y-4">
              <Card className="shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color }} 
                    />
                    {column.name}
                    <Badge variant="secondary" className="ml-auto">
                      {leadsByStatus[column.name]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Droppable droppableId={column.name}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`h-[calc(100vh-300px)] lg:h-[calc(100vh-240px)] xl:h-[calc(100vh-200px)] overflow-y-auto scrollbar-none space-y-3 p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-100' : ''
                    }`}
                  >
                    {(leadsByStatus[column.name] || []).map((lead, index) => (
                      <Draggable 
                        key={lead.id} 
                        draggableId={lead.id} 
                        index={index}
                        isDragDisabled={dragLoading === lead.id}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-all duration-200 shrink-0 ${
                              snapshot.isDragging 
                                ? 'shadow-lg rotate-2 scale-105' 
                                : 'hover:shadow-md'
                            } ${
                              dragLoading === lead.id 
                                ? 'opacity-50 pointer-events-none' 
                                : ''
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-sm line-clamp-2">
                                    {lead.name}
                                  </h3>
                                   <div className="flex gap-1 ml-2">
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleViewJourney(lead);
                                       }}
                                       title="Ver Jornada"
                                     >
                                       <BarChart3 className="w-3 h-3" />
                                     </Button>
                                     <Button
                                        variant="outline"
                                       size="sm"
                                       className="h-6 w-6 p-0"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         console.log('🔥 PIPELINE EDIT BUTTON CLICKED for lead:', lead.id);
                                         handleEditLead(lead);
                                       }}
                                       title="Editar Lead"
                                     >
                                       <Edit className="w-3 h-3" />
                                     </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAppointmentAction(lead);
                                      }}
                                    >
                                      <Calendar className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-600">
                                  {lead.email && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      <span className="truncate">{lead.email}</span>
                                    </div>
                                  )}

                                  {lead.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3 h-3" />
                                      <span>{lead.phone}</span>
                                      <WhatsAppLeadButton 
                                        phone={lead.phone} 
                                        leadName={lead.name} 
                                        size="sm" 
                                      />
                                    </div>
                                  )}

                                   {(lead.source || lead.temperature) && (
                                     <div className="flex items-center gap-2 flex-wrap">
                                       {lead.source && (
                                         <Badge variant="outline" className="text-xs">
                                           {lead.source}
                                         </Badge>
                                       )}
                                       {lead.temperature && (
                                         <Badge 
                                           variant="outline" 
                                           className={`text-xs ${
                                             lead.temperature === 'Quente' 
                                               ? 'border-red-300 text-red-700 bg-red-50' 
                                               : lead.temperature === 'Morno'
                                               ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                                               : 'border-blue-300 text-blue-700 bg-blue-50'
                                           }`}
                                         >
                                           {lead.temperature}
                                         </Badge>
                                       )}
                                     </div>
                                   )}

                                  {lead.latest_appointment && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <Calendar className="w-3 h-3" />
                                      <span className="text-xs">
                                        {formatDateTime(
                                          lead.latest_appointment.date, 
                                          lead.latest_appointment.time
                                        )}
                                      </span>
                                    </div>
                                  )}

                                  {lead.assigned_to && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      <span>{lead.assigned_to.full_name}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Tags do Lead */}
                                {lead.tags && lead.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {lead.tags.map(tag => (
                                      <TagBadge 
                                        key={tag.id} 
                                        name={tag.name} 
                                        color={tag.color} 
                                        size="sm" 
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Indicadores de atividade */}
                                {(lead.appointments_count > 0 || lead.follow_ups_count > 0) && (
                                  <div className="flex gap-2 text-xs">
                                    {lead.appointments_count > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {lead.appointments_count} agend.
                                      </Badge>
                                    )}
                                    {lead.follow_ups_count > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {lead.follow_ups_count} follow-ups
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {dragLoading === lead.id && (
                                  <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Movendo...
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddLeadDialog 
        open={leadDialogState.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            closeLeadDialog();
          }
        }} 
        onCreateLead={createLead}
      />

      <EditLeadDialog 
        open={editLeadDialogOpen} 
        onOpenChange={setEditLeadDialogOpen} 
        lead={selectedLead} 
      />

      <AddAppointmentDialog 
        open={addAppointmentDialogOpen} 
        onOpenChange={(open) => {
          setAddAppointmentDialogOpen(open);
          if (!open) {
            setAppointmentLead(null);
          }
        }}
        preselectedLead={appointmentLead}
      />

      <ViewAppointmentDialog 
        open={viewAppointmentDialogOpen}
        onOpenChange={setViewAppointmentDialogOpen}
        appointment={selectedLead?.latest_appointment || null}
      />

      <ViewLeadJourneyDialog
        leadId={selectedLead?.id || null}
        leadName={selectedLead?.name || ''}
        open={viewJourneyDialogOpen}
        onOpenChange={setViewJourneyDialogOpen}
      />
    </div>
  );
};