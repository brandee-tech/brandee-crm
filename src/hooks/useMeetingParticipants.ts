
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MeetingParticipantWithProfile {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
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
          profiles (
            full_name,
            email
          )
        `)
        .eq('meeting_id', meetingId)
        .order('created_at');
      
      if (error) throw error;
      return data as MeetingParticipantWithProfile[];
    },
    enabled: !!meetingId,
  });

  const addParticipant = useMutation({
    mutationFn: async ({ userId, role = 'participant' }: { userId: string; role?: 'organizer' | 'participant' }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert([{
          meeting_id: meetingId,
          user_id: userId,
          role,
        }])
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Participante adicionado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao adicionar participante', 
        description: error.message,
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
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Participante removido com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao remover participante', 
        description: error.message,
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
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      toast({ title: 'Papel do participante atualizado!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar participante', 
        description: error.message,
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
  };
};
