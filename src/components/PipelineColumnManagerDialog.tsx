import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { usePipelineSync } from '@/hooks/usePipelineSync';
import { cn } from '@/lib/utils';
interface PipelineColumnManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const PIPELINE_TEMPLATES = [{
  id: 'custom',
  name: 'Customizado',
  columns: []
}, {
  id: 'default',
  name: 'Vendas padrão',
  columns: [{
    name: 'Novo Lead',
    color: '#6B7280'
  }, {
    name: 'Atendimento',
    color: '#3B82F6'
  }, {
    name: 'Agendamento',
    color: '#F59E0B'
  }, {
    name: 'Follow up',
    color: '#8B5CF6'
  }, {
    name: 'Negociação',
    color: '#06B6D4'
  }]
}, {
  id: 'ecommerce',
  name: 'Loja online',
  columns: [{
    name: 'Visitante',
    color: '#6B7280'
  }, {
    name: 'Carrinho',
    color: '#F59E0B'
  }, {
    name: 'Checkout',
    color: '#3B82F6'
  }, {
    name: 'Pagamento',
    color: '#8B5CF6'
  }]
}, {
  id: 'consulting',
  name: 'Consultoria',
  columns: [{
    name: 'Contato inicial',
    color: '#6B7280'
  }, {
    name: 'Diagnóstico',
    color: '#3B82F6'
  }, {
    name: 'Proposta',
    color: '#F59E0B'
  }, {
    name: 'Negociação',
    color: '#8B5CF6'
  }]
}, {
  id: 'services',
  name: 'Serviços',
  columns: [{
    name: 'Prospect',
    color: '#6B7280'
  }, {
    name: 'Qualificação',
    color: '#3B82F6'
  }, {
    name: 'Apresentação',
    color: '#F59E0B'
  }, {
    name: 'Proposta',
    color: '#8B5CF6'
  }, {
    name: 'Fechamento',
    color: '#06B6D4'
  }]
}, {
  id: 'marketing',
  name: 'Marketing',
  columns: [{
    name: 'Lead frio',
    color: '#6B7280'
  }, {
    name: 'Lead morno',
    color: '#F59E0B'
  }, {
    name: 'Lead quente',
    color: '#EF4444'
  }, {
    name: 'MQL',
    color: '#3B82F6'
  }, {
    name: 'SQL',
    color: '#8B5CF6'
  }]
}];
const COLOR_OPTIONS = [{
  name: 'Cinza',
  value: '#6B7280'
}, {
  name: 'Azul',
  value: '#3B82F6'
}, {
  name: 'Verde',
  value: '#10B981'
}, {
  name: 'Amarelo',
  value: '#F59E0B'
}, {
  name: 'Vermelho',
  value: '#EF4444'
}, {
  name: 'Roxo',
  value: '#8B5CF6'
}, {
  name: 'Rosa',
  value: '#EC4899'
}, {
  name: 'Ciano',
  value: '#06B6D4'
}];
export const PipelineColumnManagerDialog = ({
  open,
  onOpenChange
}: PipelineColumnManagerDialogProps) => {
  const {
    columns,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refetch
  } = usePipelineColumns();
  const {
    createDefaultColumns,
    syncing
  } = usePipelineSync();
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnColor, setNewColumnColor] = useState('#3B82F6');

  // Separar colunas em inicial, ativas e finais
  const initialColumn = columns.find(col => col.position === 0 || col.name === 'Novo Lead');
  const finalColumns = columns.filter(col => col.name === 'Vendido' || col.name === 'Perdido' || col.name === 'Ganho');
  const activeColumns = columns.filter(col => col !== initialColumn && !finalColumns.includes(col)).sort((a, b) => a.position - b.position);
  const handleSelectTemplate = async (template: typeof PIPELINE_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    if (template.id === 'default') {
      await createDefaultColumns();
      await refetch();
    }
  };
  const handleEditColumn = (column: typeof columns[0]) => {
    setEditingColumnId(column.id);
    setEditingName(column.name);
  };
  const handleSaveEdit = async () => {
    if (!editingColumnId || !editingName.trim()) return;
    await updateColumn(editingColumnId, {
      name: editingName
    });
    setEditingColumnId(null);
    setEditingName('');
  };
  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setEditingName('');
  };
  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    // Removed is_protected check to allow user to manage all columns
    if (window.confirm('Tem certeza que deseja excluir esta etapa?')) {
      await deleteColumn(columnId);
    }
  };
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    const maxPosition = Math.max(...columns.map(col => col.position), 0);
    await createColumn({
      name: newColumnName,
      color: newColumnColor,
      position: maxPosition + 1
    });
    setNewColumnName('');
    setNewColumnColor('#3B82F6');
    setShowAddColumn(false);
  };
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    // Reordenar as colunas ativas
    const reorderedActiveColumns = [...activeColumns];
    const [removed] = reorderedActiveColumns.splice(sourceIndex, 1);
    reorderedActiveColumns.splice(destinationIndex, 0, removed);

    // Recalcular posições para todas as colunas
    const updatedActiveColumns = reorderedActiveColumns.map((col, index) => ({
      ...col,
      position: index + 1
    }));

    // Combinar todas as colunas com novas posições
    const allColumns = [...(initialColumn ? [{
      ...initialColumn,
      position: 0
    }] : []), ...updatedActiveColumns, ...finalColumns.map((col, i) => ({
      ...col,
      position: updatedActiveColumns.length + 1 + i
    }))];
    await reorderColumns(allColumns);
  };
  const handleClose = () => {
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader className="shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-xl">Configurar funil de vendas</DialogTitle>
            <DialogDescription>
              Customize as etapas do seu processo de vendas ou escolha um modelo pré-pronto.
            </DialogDescription>
          </div>
          <div className="flex gap-2">

          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 min-h-0 grid grid-cols-[200px_1fr] gap-6 mt-4">
        {/* Coluna esquerda - Templates */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Modelos</h4>
          <div className="space-y-1">
            {PIPELINE_TEMPLATES.map(template => <button key={template.id} className={cn("w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2", selectedTemplate === template.id ? "bg-primary text-primary-foreground" : "hover:bg-accent")} onClick={() => handleSelectTemplate(template)} disabled={syncing}>
              {selectedTemplate === template.id && <Check className="w-4 h-4" />}
              <span className={selectedTemplate !== template.id ? "ml-6" : ""}>{template.name}</span>
            </button>)}
          </div>
        </div>

        {/* Coluna direita - Etapas */}
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Etapa inicial - Leads recebidos */}
            {initialColumn && <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Leads recebidos
                  <span className="w-3 h-3 rounded-full" style={{
                    backgroundColor: initialColumn.color || '#6B7280'
                  }} />
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta etapa captura automaticamente os leads de todas as fontes.
                </p>
              </div>
              <div className="p-3 rounded-lg text-white font-medium" style={{
                backgroundColor: initialColumn.color || '#6B7280'
              }}>
                {initialColumn.name}
              </div>
            </div>}

            {/* Etapas ativas - Com drag and drop */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Etapas ativas</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Arraste para reordenar. Essas são as etapas principais do seu fluxo.
                </p>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pipeline-columns">
                  {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={cn("space-y-2 p-2 rounded-lg transition-colors", snapshot.isDraggingOver && "bg-accent/50")}>
                    {activeColumns.map((column, index) => <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided, snapshot) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={cn("flex items-center gap-2 p-3 rounded-lg transition-all", snapshot.isDragging && "shadow-lg rotate-1 scale-105")} style={{
                        backgroundColor: column.color || '#3B82F6',
                        ...provided.draggableProps.style
                      }}>
                        <GripVertical className="w-4 h-4 text-white/70 cursor-grab" />

                        {editingColumnId === column.id ? <div className="flex-1 flex items-center gap-2">
                          <Input value={editingName} onChange={e => setEditingName(e.target.value)} className="h-7 bg-white/20 border-white/30 text-white placeholder:text-white/50" autoFocus onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }} />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={handleSaveEdit}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={handleCancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div> : <>
                          <span className="flex-1 text-white font-medium">{column.name}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20" onClick={() => handleEditColumn(column)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20" onClick={() => handleDeleteColumn(column.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>}
                      </div>}
                    </Draggable>)}
                    {provided.placeholder}
                  </div>}
                </Droppable>
              </DragDropContext>

              {/* Adicionar nova etapa */}
              {showAddColumn ? <div className="space-y-3 p-3 border border-dashed rounded-lg">
                <Input placeholder="Nome da etapa" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} autoFocus onKeyDown={e => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') setShowAddColumn(false);
                }} />
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(color => <button key={color.value} className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", newColumnColor === color.value ? "border-foreground scale-110" : "border-transparent")} style={{
                    backgroundColor: color.value
                  }} onClick={() => setNewColumnColor(color.value)} title={color.name} />)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddColumn} className="flex-1">
                    Adicionar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddColumn(false)}>
                    Cancelar
                  </Button>
                </div>
              </div> : <Button variant="ghost" className="w-full justify-start text-muted-foreground border border-dashed" onClick={() => setShowAddColumn(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar etapa
              </Button>}
            </div>

            {/* Etapas finais - Conclusão */}
            {finalColumns.length > 0 && <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Conclusão</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Essas etapas marcam o fim do seu fluxo de trabalho.
                </p>
              </div>

              <div className="space-y-2">
                {finalColumns.map(column => <div key={column.id} className="p-3 rounded-lg font-medium" style={{
                  backgroundColor: column.name === 'Vendido' || column.name === 'Ganho' ? '#DCFCE7' : '#F3F4F6',
                  color: column.name === 'Vendido' || column.name === 'Ganho' ? '#166534' : '#374151'
                }}>
                  {column.name === 'Vendido' || column.name === 'Ganho' ? `${column.name} - ganho ✓` : `${column.name} - perdido`}
                </div>)}
              </div>
            </div>}
          </div>
        </ScrollArea>
      </div>
    </DialogContent>
  </Dialog>;
};