
import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/hooks/useTasks';

export const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const { tasks, loading, updateTask, deleteTask } = useTasks();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Baixa':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Em andamento':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Atrasada':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Concluída' ? 'Pendente' : 'Concluída';
    await updateTask(taskId, { status: newStatus });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Todos' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas atividades e compromissos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Agendada">Agendada</option>
              <option value="Concluída">Concluída</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={`p-6 hover:shadow-lg transition-shadow duration-200 ${
            task.status === 'Concluída' ? 'opacity-75' : ''
          }`}>
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.status === 'Concluída'}
                onCheckedChange={() => toggleTaskComplete(task.id, task.status || 'Pendente')}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${
                    task.status === 'Concluída' ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status || 'Pendente')}
                    <Badge className={getPriorityColor(task.priority || 'Média')}>{task.priority || 'Média'}</Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                    <span>•</span>
                    <span>{task.profiles?.full_name || task.profiles?.email || 'Usuário'}</span>
                    <span>•</span>
                    <span>{task.task_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'Concluída' 
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'Em andamento'
                        ? 'bg-blue-100 text-blue-700'
                        : task.status === 'Agendada'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
          <p className="text-gray-400 mt-2">Tente ajustar os filtros ou adicionar novas tarefas</p>
        </Card>
      )}
    </div>
  );
};
