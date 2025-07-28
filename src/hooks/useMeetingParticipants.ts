
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MeetingParticipantWithProfile {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  attended: boolean | null;
  attendance_marked_at: string | null;
  attendance_marked_by: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const useMeetingParticipants = (meetingId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          profiles!meeting_participants_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar participantes:', error);
        throw error;
      }

      return (data || []) as MeetingParticipantWithProfile[];
    },
    enabled: !!meetingId,
  });

  const addParticipant = useMutation({
    mutationFn: async ({ userId, role = 'participant' }: { userId: string; role?: 'organizer' | 'participant' }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id: userId,
          role
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar participante:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Participante adicionado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar participante:', error);
      toast({ 
        title: 'Erro ao adicionar participante', 
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive' 
      });
    },
  });

  const removeParticipant = useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);

      if (error) {
        console.error('Erro ao remover participante:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Participante removido com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao remover participante:', error);
      toast({ 
        title: 'Erro ao remover participante', 
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive' 
      });
    },
  });

  const updateParticipantRole = useMutation({
    mutationFn: async ({ participantId, role }: { participantId: string; role: 'organizer' | 'participant' }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ role })
        .eq('id', participantId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar papel do participante:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Papel do participante atualizado!' });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar participante:', error);
      toast({ 
        title: 'Erro ao atualizar participante', 
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive' 
      });
    },
  });

  const markAttendance = useMutation({
    mutationFn: async ({ participantId, attended }: { participantId: string; attended: boolean }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ 
          attended,
          attendance_marked_at: new Date().toISOString(),
          attendance_marked_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', participantId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar presença:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Presença atualizada com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar presença:', error);
      toast({ 
        title: 'Erro ao marcar presença', 
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive' 
      });
    },
  });

  return {
    participants,
    isLoading,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    markAttendance,
  };
};
