import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface JourneyEvent {
  id: string;
  type: 'lead_created' | 'appointment' | 'follow_up' | 'meeting' | 'task' | 'status_change' | 'field_update' | 'transfer' | 'tag_change' | 'delete';
  date: string;
  time?: string;
  title: string;
  description: string;
  status?: string;
  data: any;
  user_name?: string;
}

export const useLeadJourney = (leadId?: string) => {
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeadJourney = async (id: string) => {
    if (!id || !user) return;

    try {
      setLoading(true);
      const events: JourneyEvent[] = [];

      // Buscar dados do lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) throw leadError;

      // Adicionar evento de criação do lead
      events.push({
        id: `lead-${leadData.id}`,
        type: 'lead_created',
        date: leadData.created_at.split('T')[0],
        time: leadData.created_at.split('T')[1]?.split('.')[0],
        title: 'Lead Criado',
        description: `Lead ${leadData.name} foi criado no sistema`,
        status: leadData.status,
        data: leadData
      });

      // Buscar agendamentos do lead
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: true });

      if (appointmentsError) {
        console.error('Erro ao buscar agendamentos:', appointmentsError);
      } else if (appointments) {
        appointments.forEach(appointment => {
          events.push({
            id: `appointment-${appointment.id}`,
            type: 'appointment',
            date: appointment.date,
            time: appointment.time,
            title: appointment.title,
            description: appointment.description || 'Agendamento criado',
            status: appointment.status,
            data: appointment
          });
        });

        // Buscar follow-ups dos agendamentos
        const appointmentIds = appointments.map(a => a.id);
        if (appointmentIds.length > 0) {
          const { data: followUps, error: followUpsError } = await supabase
            .from('follow_ups')
            .select('*')
            .in('appointment_id', appointmentIds)
            .order('created_at', { ascending: true });

          if (followUpsError) {
            console.error('Erro ao buscar follow-ups:', followUpsError);
          } else if (followUps) {
            followUps.forEach(followUp => {
              events.push({
                id: `followup-${followUp.id}`,
                type: 'follow_up',
                date: followUp.scheduled_date,
                time: followUp.scheduled_time,
                title: `Follow-up #${followUp.sequence_number} - ${followUp.channel}`,
                description: followUp.message_sent || 'Follow-up criado',
                status: followUp.completed ? (followUp.result || 'Concluído') : 'Pendente',
                data: followUp
              });
            });
          }
        }
      }

      // Buscar tarefas relacionadas ao lead (buscar por nome do lead na descrição)
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .ilike('description', `%${leadData.name}%`)
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Erro ao buscar tarefas:', tasksError);
      } else if (tasks) {
        tasks.forEach(task => {
          events.push({
            id: `task-${task.id}`,
            type: 'task',
            date: task.created_at.split('T')[0],
            time: task.created_at.split('T')[1]?.split('.')[0],
            title: task.title,
            description: task.description || 'Tarefa criada',
            status: task.status,
            data: task
          });
        });
      }

      // Buscar logs de auditoria do lead
      const { data: auditLogs, error: auditError } = await supabase
        .from('lead_audit_logs')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: true });

      if (auditError) {
        console.error('Erro ao buscar audit logs:', auditError);
      } else if (auditLogs) {
        auditLogs.forEach(log => {
          // Pular o evento de criação, pois já temos o evento 'lead_created'
          if (log.action === 'create') return;

          let eventType: JourneyEvent['type'];
          let title = '';
          let description = '';

          switch (log.action) {
            case 'status_change':
              eventType = 'status_change';
              title = 'Status alterado';
              description = `"${log.old_value || 'Sem status'}" → "${log.new_value}"`;
              break;
            case 'transfer':
              eventType = 'transfer';
              title = 'Lead transferido';
              description = `De "${log.old_value || 'Não atribuído'}" para "${log.new_value}"`;
              break;
            case 'tag_add':
              eventType = 'tag_change';
              title = 'Tag adicionada';
              description = `Tag "${log.new_value}" foi adicionada`;
              break;
            case 'tag_remove':
              eventType = 'tag_change';
              title = 'Tag removida';
              description = `Tag "${log.old_value}" foi removida`;
              break;
            case 'update':
              eventType = 'field_update';
              const fieldLabel = getFieldLabel(log.field_name || '');
              title = `Campo "${fieldLabel}" alterado`;
              description = `"${log.old_value || '(vazio)'}" → "${log.new_value || '(vazio)'}"`;
              break;
            case 'delete':
              eventType = 'delete';
              title = 'Lead excluído';
              description = `Lead "${log.old_value}" foi removido do sistema`;
              break;
            default:
              eventType = 'field_update';
              title = 'Alteração';
              description = log.change_reason || 'Dados alterados';
          }

          events.push({
            id: `audit-${log.id}`,
            type: eventType,
            date: log.created_at.split('T')[0],
            time: log.created_at.split('T')[1]?.split('.')[0],
            title,
            description,
            user_name: log.user_name,
            data: log
          });
        });
      }

      // Ordenar eventos por data e hora
      const sortedEvents = events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error('Erro ao buscar jornada do lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a jornada do lead",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventStats = () => {
    const total = events.length;
    const appointments = events.filter(e => e.type === 'appointment').length;
    const followUps = events.filter(e => e.type === 'follow_up').length;
    const pendingFollowUps = events.filter(e => e.type === 'follow_up' && e.status === 'Pendente').length;
    const tasks = events.filter(e => e.type === 'task').length;
    const completedTasks = events.filter(e => e.type === 'task' && e.status === 'Concluída').length;
    const statusChanges = events.filter(e => e.type === 'status_change').length;
    const fieldUpdates = events.filter(e => e.type === 'field_update').length;

    return {
      total,
      appointments,
      followUps,
      pendingFollowUps,
      tasks,
      completedTasks,
      statusChanges,
      fieldUpdates
    };
  };

  useEffect(() => {
    if (leadId && user) {
      fetchLeadJourney(leadId);
    }
  }, [leadId, user]);

  return {
    events,
    loading,
    stats: getEventStats(),
    refetch: () => leadId ? fetchLeadJourney(leadId) : null
  };
};

// Helper para mapear nome do campo
function getFieldLabel(field: string): string {
  const fieldLabels: Record<string, string> = {
    name: 'Nome',
    email: 'E-mail',
    phone: 'Telefone',
    status: 'Status',
    temperature: 'Temperatura',
    source: 'Origem',
    product_name: 'Produto',
    product_value: 'Valor',
    partner_id: 'Parceiro',
    assigned_to: 'Responsável',
    revenue_generated: 'Receita Gerada',
    revenue_lost: 'Receita Perdida',
    tags: 'Tags'
  };
  return fieldLabels[field] || field;
}