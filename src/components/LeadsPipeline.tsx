import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, User, Eye, Edit, Trash2, Phone, BarChart3, ArrowRightLeft, Zap, MoreVertical, Settings2, Download, Upload, Copy, ArrowDownAZ, Check, Filter, Search, X } from 'lucide-react';
import { useLeadsPipeline, SortOrder } from '@/hooks/useLeadsPipeline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AddLeadDialog } from '@/components/AddLeadDialog';
import { EditLeadDialog } from '@/components/EditLeadDialog';
import { useLeadDialog } from '@/contexts/LeadDialogContext';
import { PipelineStatusIndicator } from '@/components/PipelineStatusIndicator';
import { PipelineColumnManagerDialog } from '@/components/PipelineColumnManagerDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePartners } from '@/hooks/usePartners';
import { useLeadTags } from '@/hooks/useLeadTags';
import { TagBadge } from '@/components/TagBadge';
import { WhatsAppLeadButton } from '@/components/WhatsAppLeadButton';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { ViewAppointmentDialog } from '@/components/ViewAppointmentDialog';
import { ViewLeadJourneyDialog } from '@/components/ViewLeadJourneyDialog';
import { TransferLeadDialog } from '@/components/TransferLeadDialog';
import { ImportLeadsDialog } from '@/components/ImportLeadsDialog';
import { useExportLeads } from '@/hooks/useExportLeads';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const LeadsPipeline = () => {
  console.log('🔍 LeadsPipeline component rendering');
  const navigate = useNavigate();
  
  const {
    leads,
    leadsByStatus,
    columns,
    loading,
    dragLoading,
    filters,
    setFilters,
    handleDragEnd,
    createLead,
    sortOrder,
    setSortOrder
  } = useLeadsPipeline();

  const { state: leadDialogState, openDialog: openLeadDialog, closeDialog: closeLeadDialog } = useLeadDialog();
  const { exportFilteredLeads } = useExportLeads();
  const { toast } = useToast();
  const { partners } = usePartners();
  const { tags } = useLeadTags();
  
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState(false);
  const [addAppointmentDialogOpen, setAddAppointmentDialogOpen] = useState(false);
  const [viewAppointmentDialogOpen, setViewAppointmentDialogOpen] = useState(false);
  const [viewJourneyDialogOpen, setViewJourneyDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [appointmentLead, setAppointmentLead] = useState<any>(null);
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [transferLeadDialogOpen, setTransferLeadDialogOpen] = useState(false);
  const [transferLead, setTransferLead] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.temperature !== 'todos') count++;
    if (filters.partner_id !== 'todos') count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      temperature: 'todos',
      partner_id: 'todos',
      tags: [],
      dateRange: { from: '', to: '' }
    });
  };

  const activeFiltersCount = getActiveFiltersCount();
  
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

  const handleTransferLead = (lead: any) => {
    setTransferLead(lead);
    setTransferLeadDialogOpen(true);
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast({
        title: "Sem leads",
        description: "Não há leads para exportar.",
        variant: "destructive"
      });
      return;
    }
    // Adaptar os filtros do Pipeline para o formato do LeadFilters
    const adaptedFilters = {
      searchTerm: filters.searchTerm,
      status: 'todos',
      source: 'todas',
      tags: filters.tags,
      valueRange: { min: '', max: '' },
      dateRange: filters.dateRange
    };
    exportFilteredLeads(leads, adaptedFilters);
  };

  const handleFindDuplicates = () => {
    toast({
      title: "Em breve",
      description: "Funcionalidade de localização de duplicatas será implementada em breve."
    });
  };

  const handleSort = (order: SortOrder) => {
    setSortOrder(order);
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
    <div className="p-4 h-full flex flex-col overflow-hidden">
      {/* Header fixo */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline de Leads</h1>
            <p className="text-sm text-gray-600">Acompanhe a jornada dos seus leads</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10 w-64"
              />
            </div>
            
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperatura</label>
                    <Select
                      value={filters.temperature}
                      onValueChange={(value) => setFilters({ ...filters, temperature: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="Quente">🔥 Quente</SelectItem>
                        <SelectItem value="Morno">🟡 Morno</SelectItem>
                        <SelectItem value="Frio">❄️ Frio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Parceiro</label>
                    <Select
                      value={filters.partner_id}
                      onValueChange={(value) => setFilters({ ...filters, partner_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {partners
                          .filter(partner => partner.status === 'ativo')
                          .map((partner) => (
                            <SelectItem key={partner.id} value={partner.id}>
                              {partner.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, from: e.target.value } })}
                        className="text-sm"
                      />
                      <Input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, to: e.target.value } })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={() => navigate('/automation')}>
              <Zap className="w-4 h-4 mr-2" />
              Automize
            </Button>
            <Button onClick={openLeadDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border">
                <DropdownMenuItem onClick={() => setPipelineDialogOpen(true)}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Editar funil de vendas
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Importar
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleExportLeads}>
                  <Upload className="w-4 h-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleFindDuplicates}>
                  <Copy className="w-4 h-4 mr-2" />
                  Localizar duplicadas
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowDownAZ className="w-4 h-4 mr-2" />
                    Ordenar
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-background border">
                    <DropdownMenuItem onClick={() => handleSort('last_event')}>
                      Por último evento
                      {sortOrder === 'last_event' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('created_at')}>
                      Por data de criação
                      {sortOrder === 'created_at' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('name')}>
                      Por nome
                      {sortOrder === 'name' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('sale')}>
                      Por venda
                      {sortOrder === 'sale' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <PipelineStatusIndicator />

        <PipelineColumnManagerDialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen} />
      </div>

      {/* Área scrollável das colunas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 h-full pb-4">
            {columns.map(column => {
              const columnLeads = leadsByStatus[column.name] || [];
              const leadsCount = columnLeads.length;
              const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.product_value || 0), 0);
              
              return (
              <div key={column.id} className="flex-shrink-0 w-[300px] flex flex-col">
              <Card className="shrink-0 mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color }} 
                    />
                    {column.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {leadsCount} {leadsCount === 1 ? 'lead' : 'leads'}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                  </p>
                </CardHeader>
              </Card>

              <Droppable droppableId={column.name}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent space-y-3 p-2 rounded-lg transition-colors ${
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
                                       variant="ghost"
                                       size="sm"
                                       className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleTransferLead(lead);
                                       }}
                                       title="Transferir Lead"
                                     >
                                       <ArrowRightLeft className="w-3 h-3" />
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
              );
            })}
          </div>
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

      <TransferLeadDialog
        leadId={transferLead?.id || null}
        leadName={transferLead?.name || ''}
        currentAssignedTo={transferLead?.assigned_to || null}
        open={transferLeadDialogOpen}
        onOpenChange={(open) => {
          setTransferLeadDialogOpen(open);
          if (!open) {
            setTransferLead(null);
          }
        }}
      />

      <ImportLeadsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
};