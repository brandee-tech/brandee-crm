
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: number;
  lead_id: string | null;
  contact_id: string | null;
  scheduled_by: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  leads?: {
    name: string;
    company: string | null;
  };
  contacts?: {
    name: string;
    company_id: string | null;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (
            name,
            company
          ),
          contacts (
            name,
            company_id
          )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
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

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'leads' | 'contacts'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          leads (
            name,
            company
          ),
          contacts (
            name,
            company_id
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
            name,
            company
          ),
          contacts (
            name,
            company_id
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
      throw error;
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
