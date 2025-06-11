
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useToast } from '@/hooks/use-toast';

export const SystemSettings = () => {
  const { toast } = useToast();
  const { columns, createColumn, deleteColumn } = usePipelineColumns();
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    setIsAddingColumn(true);
    try {
      await createColumn({
        name: newColumnName,
        color: '#3B82F6',
        order_index: columns.length,
      });
      setNewColumnName('');
      toast({
        title: 'Coluna adicionada',
        description: 'Nova coluna do pipeline criada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a coluna.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      toast({
        title: 'Coluna removida',
        description: 'Coluna do pipeline removida com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a coluna.',
        variant: 'destructive',
      });
    }
  };

  const leadStatuses = [
    { name: 'Novo Lead', color: '#10B981' },
    { name: 'Contactado', color: '#3B82F6' },
    { name: 'Qualificado', color: '#F59E0B' },
    { name: 'Proposta Enviada', color: '#8B5CF6' },
    { name: 'Negociação', color: '#F97316' },
    { name: 'Fechado', color: '#059669' },
    { name: 'Perdido', color: '#EF4444' },
  ];

  const leadSources = [
    'Website',
    'Redes Sociais',
    'Google Ads',
    'Facebook Ads',
    'Indicação',
    'Cold Email',
    'Telefone',
    'Evento',
    'Outros'
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Pipeline</CardTitle>
          <CardDescription>
            Gerencie as colunas do seu pipeline de vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="font-medium">{column.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteColumn(column.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Nome da nova coluna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAddColumn}
              disabled={isAddingColumn || !newColumnName.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lead Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Leads</CardTitle>
          <CardDescription>
            Status e fontes de leads disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Status de Leads</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {leadStatuses.map((status, index) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: status.color }}
                  className="text-white"
                >
                  {status.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Fontes de Leads</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {leadSources.map((source, index) => (
                <Badge key={index} variant="outline">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Workflow</CardTitle>
          <CardDescription>
            Automatizações e fluxos de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto-seguimento de leads</h4>
                <p className="text-sm text-gray-600">
                  Criar tarefas automáticas de seguimento para novos leads
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Notificações de pipeline</h4>
                <p className="text-sm text-gray-600">
                  Receber notificações quando leads mudarem de estágio
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Relatórios automáticos</h4>
                <p className="text-sm text-gray-600">
                  Enviar relatórios de desempenho por email semanalmente
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
