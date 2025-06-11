
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
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
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
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      if (data) {
        setTasks(prev => [data, ...prev]);
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
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      if (data) {
        setTasks(prev => prev.map(task => task.id === id ? data : task));
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
