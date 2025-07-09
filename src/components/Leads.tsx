
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Upload, Download, Route } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLeads } from '@/hooks/useLeads';
import { EditLeadDialog } from './EditLeadDialog';
import { AddLeadDialog } from './AddLeadDialog';
import { ImportLeadsDialog } from './ImportLeadsDialog';
import { ViewLeadJourneyDialog } from './ViewLeadJourneyDialog';
import { LeadFilters, LeadFilterState } from './LeadFilters';
import { TagBadge } from './TagBadge';
import { WhatsAppLeadButton } from './WhatsAppLeadButton';
import { useExportLeads } from '@/hooks/useExportLeads';

export const Leads = () => {
  const [editingLead, setEditingLead] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [journeyDialogOpen, setJourneyDialogOpen] = useState(false);
  const [selectedLeadForJourney, setSelectedLeadForJourney] = useState<{id: string, name: string} | null>(null);
  const [filters, setFilters] = useState<LeadFilterState>({
    searchTerm: '',
    status: 'todos',
    source: 'todas',
    tags: [],
    valueRange: { min: '', max: '' },
    dateRange: { from: '', to: '' }
  });
  
  const { leads, loading, isUpdating, deleteLead, createLead } = useLeads();
  const { exportFilteredLeads } = useExportLeads();

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Busca por texto (nome, email)
      const searchMatch = !filters.searchTerm || 
        lead.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Filtro por status
      const statusMatch = filters.status === 'todos' || lead.status === filters.status;

      // Filtro por origem
      const sourceMatch = filters.source === 'todas' || lead.source === filters.source;

      // Filtro por período de criação
      const dateMatch = (() => {
        if (!filters.dateRange.from && !filters.dateRange.to) return true;
        
        const leadDate = new Date(lead.created_at);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : new Date('1970-01-01');
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to + 'T23:59:59') : new Date();
        
        return leadDate >= fromDate && leadDate <= toDate;
      })();

      // Filtro por tags
      const tagsMatch = filters.tags.length === 0 || 
        (lead.tags && lead.tags.some(tag => filters.tags.includes(tag.id)));

      return searchMatch && statusMatch && sourceMatch && tagsMatch && dateMatch;
    });
  }, [leads, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo Lead':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Atendimento':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Agendamento':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Reagendamento':
        return 'bg-orange-200 text-orange-800 border-orange-300';
      case 'No Show':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Follow up':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Negociação':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Vendido':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Perdido':
        return 'bg-red-200 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'Quente':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Morno':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Frio':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
  };

  const handleViewJourney = (lead: any) => {
    setSelectedLeadForJourney({ id: lead.id, name: lead.name });
    setJourneyDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-4 md:py-8 flex items-center justify-center">
        <div className="text-lg">Carregando leads...</div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie seus prospects e oportunidades</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
           <Button 
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => exportFilteredLeads(filteredLeads, filters)}
            className="flex-1 sm:flex-none"
            disabled={filteredLeads.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <LeadFilters 
          onFiltersChange={setFilters}
          totalLeads={leads.length}
          filteredCount={filteredLeads.length}
        />
      </div>

      <div className="grid gap-4 px-4 md:px-8">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                  <Badge className={getStatusColor(lead.status || 'Novo Lead')}>{lead.status || 'Novo Lead'}</Badge>
                  {lead.temperature && (
                    <Badge className={getTemperatureColor(lead.temperature)} variant="outline">
                      {lead.temperature}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="break-all">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span className="break-all">{lead.phone}</span>
                      <WhatsAppLeadButton phone={lead.phone} leadName={lead.name} />
                    </div>
                  )}
                </div>
                
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lead.tags.map((tag) => (
                      <TagBadge
                        key={tag.id}
                        name={tag.name}
                        color={tag.color}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Origem: {lead.source || 'N/A'}</p>
                  {lead.partner && (
                    <p className="text-sm text-blue-600">Parceiro: {lead.partner.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Criado: {formatDate(lead.created_at)}</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewJourney(lead)}
                    className="flex-1 sm:flex-none"
                  >
                    <Route className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Jornada</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lead)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="sm:hidden">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o lead "{lead.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(lead.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 px-4 md:px-8">
          <div className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</div>
          <p className="text-gray-600">
            {leads.length === 0 
              ? 'Comece criando seu primeiro lead.'
              : 'Tente ajustar os filtros para encontrar leads.'
            }
          </p>
        </div>
      )}

      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AddLeadDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreateLead={createLead}
      />

      <ImportLeadsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <ViewLeadJourneyDialog
        leadId={selectedLeadForJourney?.id || null}
        leadName={selectedLeadForJourney?.name || ''}
        open={journeyDialogOpen}
        onOpenChange={setJourneyDialogOpen}
      />
    </div>
  );
};
