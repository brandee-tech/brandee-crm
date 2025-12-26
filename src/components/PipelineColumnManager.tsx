import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { usePipelineSync } from '@/hooks/usePipelineSync';

interface PipelineColumn {
  id: string;
  name: string;
  position: number;
  color: string;
  is_protected?: boolean;
}

export const PipelineColumnManager = () => {
  const { columns, createColumn, updateColumn, deleteColumn, reorderColumns } = usePipelineColumns();
  const { syncPipelineColumns, createDefaultColumns, syncing } = usePipelineSync();
  const [editingColumn, setEditingColumn] = useState<PipelineColumn | null>(null);
  const [newColumn, setNewColumn] = useState({ name: '', color: '#3B82F6' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const handleCreateColumn = async () => {
    if (!newColumn.name.trim()) return;

    const maxOrder = Math.max(...columns.map(col => col.position), 0);
    await createColumn({
      name: newColumn.name,
      color: newColumn.color,
      position: maxOrder + 1
    });

    setNewColumn({ name: '', color: '#3B82F6' });
    setDialogOpen(false);
  };

  const handleUpdateColumn = async () => {
    if (!editingColumn || !editingColumn.name.trim()) return;

    await updateColumn(editingColumn.id, {
      name: editingColumn.name,
      color: editingColumn.color
    });

    setEditingColumn(null);
    setEditDialogOpen(false);
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column?.is_protected) {
      alert('Esta coluna não pode ser excluída pois é uma coluna base do sistema.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta coluna? Todos os leads nela serão movidos para a primeira coluna.')) {
      await deleteColumn(columnId);
    }
  };

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      return;
    }

    const draggedColumn = columns.find(col => col.id === draggedColumnId);
    const targetColumn = columns.find(col => col.id === targetColumnId);

    if (!draggedColumn || !targetColumn) {
      setDraggedColumnId(null);
      return;
    }

    // Criar nova ordem das colunas
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    const draggedIndex = sortedColumns.findIndex(col => col.id === draggedColumnId);
    const targetIndex = sortedColumns.findIndex(col => col.id === targetColumnId);

    // Remover a coluna arrastada e inserir na nova posição
    const reorderedColumns = [...sortedColumns];
    const [removed] = reorderedColumns.splice(draggedIndex, 1);
    reorderedColumns.splice(targetIndex, 0, removed);

    // Atualizar os índices
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      position: index + 1
    }));

    await reorderColumns(updatedColumns);
    setDraggedColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedColumnId(null);
  };

  const colorOptions = [
    { name: 'Azul', value: 'hsl(var(--primary))' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Amarelo', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Cinza', value: '#6B7280' },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Gerenciar Colunas do Pipeline</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createDefaultColumns}
            disabled={syncing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Colunas Padrão
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={syncPipelineColumns}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Coluna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Coluna</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Coluna</Label>
                  <Input
                    id="name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Qualificado"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full border-2 ${newColumn.color === color.value ? 'border-gray-800' : 'border-gray-300'
                          }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setNewColumn(prev => ({ ...prev, color: color.value }))}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateColumn} className="flex-1">
                    Criar Coluna
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Arraste as colunas para reordená-las. Use "Sincronizar" para criar colunas baseadas nos status dos agendamentos existentes.
        </p>
        {columns.map((column) => (
          <div
            key={column.id}
            draggable
            onDragStart={(e) => handleDragStart(e, column.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all ${draggedColumnId === column.id
                ? 'opacity-50 bg-gray-50'
                : 'hover:bg-gray-50'
              }`}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <span className="flex-1 font-medium">{column.name}</span>
            {column.is_protected && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Protegida
              </span>
            )}
            <span className="text-sm text-gray-500">Ordem: {column.position}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingColumn(column);
                setEditDialogOpen(true);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${column.is_protected ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}`}
              onClick={() => handleDeleteColumn(column.id)}
              disabled={column.is_protected}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coluna</DialogTitle>
          </DialogHeader>
          {editingColumn && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Coluna</Label>
                <Input
                  id="edit-name"
                  value={editingColumn.name}
                  onChange={(e) => setEditingColumn(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${editingColumn.color === color.value ? 'border-gray-800' : 'border-gray-300'
                        }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setEditingColumn(prev => prev ? ({ ...prev, color: color.value }) : null)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateColumn} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};