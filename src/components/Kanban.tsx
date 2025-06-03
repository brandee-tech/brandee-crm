
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/hooks/useLeads';
import { Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { EditLeadDialog } from './EditLeadDialog';

export const Kanban = () => {
  const { leads, loading, deleteLead, updateLead } = useLeads();
  const [editingLead, setEditingLead] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const statusColumns = [
    { status: 'Frio', title: 'Frio', color: 'bg-blue-100 border-blue-200' },
    { status: 'Morno', title: 'Morno', color: 'bg-yellow-100 border-yellow-200' },
    { status: 'Quente', title: 'Quente', color: 'bg-red-100 border-red-200' },
  ];

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead(id);
    }
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedLead) return;

    const leadToUpdate = leads.find(lead => lead.id === draggedLead);
    if (!leadToUpdate || leadToUpdate.status === newStatus) {
      setDraggedLead(null);
      return;
    }

    await updateLead(draggedLead, { status: newStatus });
    setDraggedLead(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando kanban...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pipeline de Vendas</h1>
        <p className="text-gray-600 mt-1">Visualize seus leads por status - arraste para mover entre colunas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => {
          const columnLeads = getLeadsByStatus(column.status);
          const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

          return (
            <div key={column.status} className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${column.color}`}>
                <h2 className="font-semibold text-lg">{column.title}</h2>
                <p className="text-sm text-gray-600">
                  {columnLeads.length} leads • {formatValue(totalValue)}
                </p>
              </div>

              <div
                className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors border-2 border-dashed ${
                  draggedLead ? 'border-gray-300 bg-gray-50' : 'border-transparent'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {columnLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 transition-all cursor-move ${
                      draggedLead === lead.id 
                        ? 'opacity-50 rotate-2 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{lead.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(lead);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <Badge variant="outline" className="text-xs">
                        {lead.source || 'N/A'}
                      </Badge>
                      <span className="font-medium text-sm">{formatValue(lead.value)}</span>
                    </div>
                  </Card>
                ))}

                {columnLeads.length === 0 && (
                  <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    Nenhum lead neste status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
