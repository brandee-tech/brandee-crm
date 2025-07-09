
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
      console.log('Fetching meetings...');
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching meetings:', error);
        throw error;
      }
      console.log('Meetings fetched:', data);
      return (data || []) as Meeting[];
    },
  });

  const createMeeting = useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating meeting with data:', meeting);
      
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert([meeting])
        .select()
        .single();
      
      if (meetingError) {
        console.error('Error creating meeting:', meetingError);
        throw meetingError;
      }
      
      // Adicionar o criador como organizador automaticamente
      console.log('Would add participant:', {
        meeting_id: meetingData.id,
        user_id: meeting.organizer_id,
        role: 'organizer'
      });
      
      console.log('Meeting created successfully:', meetingData);
      return meetingData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião criada com sucesso!' });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({ 
        title: 'Erro ao criar reunião', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      console.log('Updating meeting:', id, updates);
      
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating meeting:', error);
        throw error;
      }
      
      console.log('Meeting updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
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

  const rescheduleMeeting = useMutation({
    mutationFn: async ({ 
      originalMeetingId, 
      newMeetingData, 
      reschedule_reason 
    }: {
      originalMeetingId: string;
      newMeetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'status'>;
      reschedule_reason: string;
    }) => {
      console.log('Reagendando reunião:', { originalMeetingId, newMeetingData, reschedule_reason });
      
      // Criar nova reunião
      const { data: newMeeting, error: createError } = await supabase
        .from('meetings')
        .insert([{
          ...newMeetingData,
          status: 'Agendada',
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Erro ao criar nova reunião:', createError);
        throw createError;
      }
      
      // Atualizar reunião original
      const { error: updateError } = await supabase
        .from('meetings')
        .update({
          status: 'Reagendada',
          rescheduled_to_id: newMeeting.id,
          reschedule_reason: reschedule_reason,
        })
        .eq('id', originalMeetingId);
      
      if (updateError) {
        console.error('Erro ao atualizar reunião original:', updateError);
        throw updateError;
      }
      
      console.log('Reunião reagendada com sucesso:', { original: originalMeetingId, new: newMeeting.id });
      return newMeeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Reunião reagendada com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro no reagendamento:', error);
      toast({ 
        title: 'Erro ao reagendar reunião', 
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
    rescheduleMeeting,
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
      return (data || null) as Meeting | null;
    },
    enabled: !!meetingId,
  });

  const { data: agendas = [] } = useQuery({
    queryKey: ['meeting-agendas', meetingId],
    queryFn: async () => {
      // Stub: return empty array for now
      return [] as MeetingAgenda[];
    },
    enabled: !!meetingId,
  });

  const { data: minutes } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      // Stub: return null for now
      return null as MeetingMinutes | null;
    },
    enabled: !!meetingId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: async () => {
      // Stub: return empty array for now
      return [] as MeetingAttachment[];
    },
    enabled: !!meetingId,
  });

  const saveMinutes = useMutation({
    mutationFn: async (content: string) => {
      console.log('Would save minutes:', content);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Ata salva com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao salvar ata', 
        variant: 'destructive' 
      });
    },
  });

  const addAgendaItem = useMutation({
    mutationFn: async (item: Omit<MeetingAgenda, 'id' | 'created_at'>) => {
      console.log('Would add agenda item:', item);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Item da pauta adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar item', 
        variant: 'destructive' 
      });
    },
  });

  const addAttachment = useMutation({
    mutationFn: async (attachment: Omit<MeetingAttachment, 'id' | 'created_at'>) => {
      console.log('Would add attachment:', attachment);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Anexo adicionado!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao adicionar anexo', 
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
