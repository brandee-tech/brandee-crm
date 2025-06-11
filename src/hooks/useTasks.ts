
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string | null;
  status: string | null;
  assignee_id: string | null;
  task_type: string | null;
  company_id: string;
  created_at: string;
  created_by: string | null;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      // First fetch tasks without the assignee join
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Then fetch assignee data separately and merge it
      const tasksWithAssignees = await Promise.all(
        (tasksData || []).map(async (task) => {
          if (task.assignee_id) {
            const { data: assigneeData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', task.assignee_id)
              .single();
            
            return {
              ...task,
              assignee: assigneeData || null
            };
          }
          return {
            ...task,
            assignee: null
          };
        })
      );

      setTasks(tasksWithAssignees);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('company_id', profileData.company_id)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'company_id' | 'created_by' | 'assignee'>): Promise<void> => {
    try {
      // Buscar company_id do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          ...taskData, 
          created_by: user?.id,
          company_id: profileData.company_id 
        }])
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        // Fetch assignee data if there is one
        let assigneeData = null;
        if (data.assignee_id) {
          const { data: assignee } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', data.assignee_id)
            .single();
          assigneeData = assignee;
        }

        const taskWithAssignee = {
          ...data,
          assignee: assigneeData
        };

        setTasks(prev => [taskWithAssignee, ...prev]);
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        // Fetch assignee data if there is one
        let assigneeData = null;
        if (data.assignee_id) {
          const { data: assignee } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', data.assignee_id)
            .single();
          assigneeData = assignee;
        }

        const taskWithAssignee = {
          ...data,
          assignee: assigneeData
        };

        setTasks(prev => prev.map(task => task.id === id ? taskWithAssignee : task));
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a tarefa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchUsers();
    }
  }, [user]);

  return {
    tasks,
    users,
    loading,
    usersLoading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};
