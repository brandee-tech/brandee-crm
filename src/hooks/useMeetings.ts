
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting, MeetingAgenda, MeetingMinutes, MeetingAttachment } from '@/types/meeting';
import { useToast } from '@/hooks/use-toast';

export const useMeetings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Meeting[];
    },
  });

  const createMeeting = useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert([meeting])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião criada com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao criar reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao atualizar reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao excluir reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    meetings,
    isLoading,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
};

export const useMeetingDetails = (meetingId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meeting } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (error) throw error;
      return data as Meeting;
    },
    enabled: !!meetingId,
  });

  const { data: agendas = [] } = useQuery({
    queryKey: ['meeting-agendas', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index');
      
      if (error) throw error;
      return data as MeetingAgenda[];
    },
    enabled: !!meetingId,
  });

  const { data: minutes } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as MeetingMinutes | null;
    },
    enabled: !!meetingId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MeetingAttachment[];
    },
    enabled: !!meetingId,
  });

  const saveMinutes = useMutation({
    mutationFn: async (content: string) => {
      if (minutes) {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', minutes.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert([{ meeting_id: meetingId, content }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', meetingId] });
      toast({ title: 'Ata salva com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao salvar ata', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const addAgendaItem = useMutation({
    mutationFn: async (item: Omit<MeetingAgenda, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] });
      toast({ title: 'Item da pauta adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar item', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const addAttachment = useMutation({
    mutationFn: async (attachment: Omit<MeetingAttachment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meeting_attachments')
        .insert([attachment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-attachments', meetingId] });
      toast({ title: 'Anexo adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar anexo', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    meeting,
    agendas,
    minutes,
    attachments,
    saveMinutes,
    addAgendaItem,
    addAttachment,
  };
};
