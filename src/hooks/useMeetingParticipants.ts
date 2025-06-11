
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
  } | null;
}

export const useMeetingParticipants = (meetingId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      // Use a manual join query instead of relying on automatic relationships
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          id,
          meeting_id,
          user_id,
          role,
          created_at
        `)
        .eq('meeting_id', meetingId)
        .order('created_at');
      
      if (error) throw error;

      // Fetch profiles separately and merge them
      const userIds = data.map(participant => participant.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge participants with their profiles
      const participantsWithProfiles = data.map(participant => ({
        ...participant,
        profiles: profiles?.find(profile => profile.id === participant.user_id) || null
      }));

      return participantsWithProfiles as MeetingParticipantWithProfile[];
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
        .select()
        .single();
      
      if (error) throw error;

      // Fetch the profile for the new participant
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      return {
        ...data,
        profiles: profile
      };
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
        .select()
        .single();
      
      if (error) throw error;

      // Fetch the profile for the updated participant
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.user_id)
        .single();

      if (profileError) throw profileError;

      return {
        ...data,
        profiles: profile
      };
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
