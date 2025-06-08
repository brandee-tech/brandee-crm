
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLeads } from '@/hooks/useLeads';
import { EditLeadDialog } from './EditLeadDialog';
import { AddLeadDialog } from './AddLeadDialog';
import { LeadFilters, LeadFilterState } from './LeadFilters';

export const Leads = () => {
  const [editingLead, setEditingLead] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<LeadFilterState>({
    searchTerm: '',
    status: 'todos',
    source: 'todas',
    valueRange: { min: '', max: '' },
    dateRange: { from: '', to: '' }
  });
  
  const { leads, loading, deleteLead } = useLeads();

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

      // Filtro por faixa de valor
      const valueMatch = (() => {
        const leadValue = lead.value || 0;
        const minValue = filters.valueRange.min ? parseFloat(filters.valueRange.min) : 0;
        const maxValue = filters.valueRange.max ? parseFloat(filters.valueRange.max) : Infinity;
        return leadValue >= minValue && leadValue <= maxValue;
      })();

      // Filtro por período de criação
      const dateMatch = (() => {
        if (!filters.dateRange.from && !filters.dateRange.to) return true;
        
        const leadDate = new Date(lead.created_at);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : new Date('1970-01-01');
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to + 'T23:59:59') : new Date();
        
        return leadDate >= fromDate && leadDate <= toDate;
      })();

      return searchMatch && statusMatch && sourceMatch && valueMatch && dateMatch;
    });
  }, [leads, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const formatValue = (value: number | null) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando leads...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie seus prospects e oportunidades</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <LeadFilters 
        onFiltersChange={setFilters}
        totalLeads={leads.length}
        filteredCount={filteredLeads.length}
      />

      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                  <Badge className={getStatusColor(lead.status || 'Frio')}>{lead.status || 'Frio'}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatValue(lead.value)}</p>
                  <p className="text-sm text-gray-500">Origem: {lead.source || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{formatDate(lead.created_at)}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(lead)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
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
                          Tem certeza que deseja excluir o lead "{lead.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(lead.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
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
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum lead encontrado</p>
          <p className="text-gray-400 mt-2">Tente ajustar os filtros ou adicionar novos leads</p>
        </Card>
      )}

      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AddLeadDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
};
