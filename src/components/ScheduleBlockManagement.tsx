import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CalendarDays,
  Filter
} from 'lucide-react';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { ScheduleBlockDialog } from './ScheduleBlockDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ScheduleBlockManagement = () => {
  const { scheduleBlocks, deleteBlock, isLoading } = useScheduleBlocks();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const handleEdit = (block: any) => {
    setBlockToEdit(block);
    setDialogOpen(true);
  };

  const handleDelete = async (blockId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      try {
        await deleteBlock.mutateAsync(blockId);
        toast({
          title: "Sucesso",
          description: "Bloqueio removido com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover bloqueio",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateNew = () => {
    setBlockToEdit(null);
    setDialogOpen(true);
  };

  const filteredBlocks = scheduleBlocks.filter(block => {
    if (filters.type !== 'all' && block.block_type !== filters.type) {
      return false;
    }
    
    if (filters.dateFrom && block.start_date < filters.dateFrom) {
      return false;
    }
    
    if (filters.dateTo && block.start_date > filters.dateTo) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Carregando bloqueios...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciar Horários</h1>
          <p className="text-muted-foreground">
            Configure seus bloqueios de horário para controlar sua disponibilidade
          </p>
        </div>
        
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Bloqueio
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Bloqueio</Label>
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="time_slot">Horário Específico</SelectItem>
                <SelectItem value="full_day">Dia Inteiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Bloqueios */}
      <div className="space-y-4">
        {filteredBlocks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum bloqueio encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {scheduleBlocks.length === 0 
                  ? 'Você ainda não criou nenhum bloqueio de horário'
                  : 'Nenhum bloqueio corresponde aos filtros aplicados'
                }
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Bloqueio
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBlocks.map((block) => (
            <Card key={block.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={block.block_type === 'full_day' ? 'default' : 'secondary'}>
                        {block.block_type === 'full_day' ? (
                          <>
                            <CalendarDays className="w-3 h-3 mr-1" />
                            Dia Inteiro
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Horário Específico
                          </>
                        )}
                      </Badge>
                      
                      {block.is_recurring && (
                        <Badge variant="outline">Recorrente</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatDate(block.start_date)}
                          {block.end_date && ` até ${formatDate(block.end_date)}`}
                        </span>
                      </div>
                      
                      {block.block_type === 'time_slot' && block.start_time && block.end_time && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {formatTime(block.start_time)} às {formatTime(block.end_time)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {block.reason && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Motivo:</strong> {block.reason}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(block)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(block.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ScheduleBlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        blockToEdit={blockToEdit}
      />
    </div>
  );
};