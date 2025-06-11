
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Tag, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string | null;
  status: string | null;
  assignee_id: string | null;
  task_type: string | null;
  created_at: string;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

interface ViewTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewTaskDialog = ({ task, open, onOpenChange }: ViewTaskDialogProps) => {
  if (!task) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-700';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-700';
      case 'Agendada':
        return 'bg-purple-100 text-purple-700';
      case 'Pendente':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPP', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPp', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status e Prioridade */}
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(task.status || 'Pendente')}>
              {task.status || 'Pendente'}
            </Badge>
            <Badge className={getPriorityColor(task.priority || 'Média')}>
              {task.priority || 'Média'}
            </Badge>
          </div>

          <Separator />

          {/* Descrição */}
          {task.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <FileText className="w-4 h-4" />
                Descrição
              </div>
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Informações principais */}
          <div className="grid grid-cols-1 gap-4">
            {/* Data de Vencimento */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 min-w-[120px]">
                <Calendar className="w-4 h-4" />
                Vencimento
              </div>
              <span className="text-gray-600">{formatDate(task.due_date)}</span>
            </div>

            {/* Responsável */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 min-w-[120px]">
                <User className="w-4 h-4" />
                Responsável
              </div>
              <span className="text-gray-600">
                {task.assignee?.full_name || task.assignee?.email || 'Não atribuído'}
              </span>
            </div>

            {/* Tipo */}
            {task.task_type && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 min-w-[120px]">
                  <Tag className="w-4 h-4" />
                  Tipo
                </div>
                <span className="text-gray-600">{task.task_type}</span>
              </div>
            )}

            {/* Data de Criação */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 min-w-[120px]">
                <Clock className="w-4 h-4" />
                Criada em
              </div>
              <span className="text-gray-600">{formatDateTime(task.created_at)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
