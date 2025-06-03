
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      // Primeiro, obter o role do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role_id,
          roles (
            name,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const userRole = profileData?.roles?.name;
      console.log('User role:', userRole);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Aplicar filtros baseados no role
      if (userRole === 'Closer') {
        // Closers só veem agendamentos onde eles são assigned_to
        query = query.eq('assigned_to', user.id);
      }
      // SDRs e Admins veem todos os agendamentos (sem filtro adicional)

      const { data, error } = await query;

      if (error) throw error;
      console.log('Agendamentos carregados:', data);
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'leads' | 'assigned_closer'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      setAppointments(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      setAppointments(prev => prev.map(appointment => appointment.id === id ? data : appointment));
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
};
