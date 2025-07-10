import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting, MeetingAgenda, MeetingMinutes, MeetingAttachment } from '@/types/meeting';
import { useToast } from '@/hooks/use-toast';

export const useMeetingDetails = (meetingId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meeting, isLoading: meetingLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      if (!meetingId) return null;
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (error) {
        console.error('Error fetching meeting:', error);
        throw error;
      }
      
      return data as Meeting;
    },
    enabled: !!meetingId,
  });

  const { data: agenda = [] } = useQuery({
    queryKey: ['meeting-agendas', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];
      
      const { data, error } = await supabase
        .from('meeting_agendas')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('Error fetching agendas:', error);
        return [];
      }
      
      return (data || []) as MeetingAgenda[];
    },
    enabled: !!meetingId,
  });

  const { data: minutes } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      if (!meetingId) return null;
      
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching minutes:', error);
        return null;
      }
      
      return data as MeetingMinutes | null;
    },
    enabled: !!meetingId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];
      
      const { data, error } = await supabase
        .from('meeting_attachments')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching attachments:', error);
        return [];
      }
      
      return (data || []) as MeetingAttachment[];
    },
    enabled: !!meetingId,
  });

  const updateMeeting = useMutation({
    mutationFn: async (updates: Partial<Meeting>) => {
      if (!meetingId) throw new Error('Meeting ID is required');
      
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error('Error updating meeting:', error);
      toast({ 
        title: 'Erro ao atualizar reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const addAgendaItem = useMutation({
    mutationFn: async (agendaItem: Omit<MeetingAgenda, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meeting_agendas')
        .insert([agendaItem])
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
      console.error('Error adding agenda item:', error);
      toast({ 
        title: 'Erro ao adicionar item', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMinutes = useMutation({
    mutationFn: async (content: string) => {
      if (!meetingId) throw new Error('Meeting ID is required');
      
      // Tentar atualizar primeiro, se não existir, criar
      const { data: existingMinutes } = await supabase
        .from('meeting_minutes')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();
      
      if (existingMinutes) {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update({ content })
          .eq('meeting_id', meetingId)
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
      console.error('Error saving minutes:', error);
      toast({ 
        title: 'Erro ao salvar ata', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const uploadAttachment = useMutation({
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
      console.error('Error adding attachment:', error);
      toast({ 
        title: 'Erro ao adicionar anexo', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    meeting,
    agenda,
    minutes,
    attachments,
    loading: meetingLoading,
    updateMeeting,
    addAgendaItem,
    updateMinutes,
    uploadAttachment
  };
};