
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { Meeting } from '@/types/meeting';

export const useMeetingsForCalendar = () => {
  const { user } = useAuth();
  const { profiles } = useProfiles();

  const currentUserProfile = profiles.find(p => p.id === user?.id);
  
  // Verificar se é admin através das permissões do cargo
  const userRole = currentUserProfile?.roles;
  const isAdmin = userRole?.permissions && 
    typeof userRole.permissions === 'object' && 
    (userRole.permissions as any).admin && 
    typeof (userRole.permissions as any).admin === 'object';

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings-for-calendar', user?.id, isAdmin],
    queryFn: async () => {
      if (!user?.id || !currentUserProfile?.company_id) return [];

      if (isAdmin) {
        // Admin vê todas as reuniões da empresa
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', currentUserProfile.company_id)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as Meeting[];
      } else {
        console.log('Buscando reuniões para usuário não-admin:', user.id);
        
        // Buscar reuniões onde o usuário é participante
        const { data: participantData, error: participantError } = await supabase
          .from('meeting_participants')
          .select('meeting_id')
          .eq('user_id', user.id);
        
        if (participantError) {
          console.error('Erro ao buscar participações:', participantError);
          throw participantError;
        }
        
        const participantMeetingIds = participantData.map(p => p.meeting_id);
        console.log('IDs de reuniões como participante:', participantMeetingIds);
        
        // Buscar reuniões onde o usuário é organizador OU participante
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', currentUserProfile.company_id)
          .or(`organizer_id.eq.${user.id},id.in.(${participantMeetingIds.length > 0 ? participantMeetingIds.join(',') : 'null'})`)
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Erro ao buscar reuniões:', error);
          throw error;
        }
        
        console.log('Reuniões encontradas:', data?.length || 0);
        return data as Meeting[];
      }
    },
    enabled: !!user?.id && !!currentUserProfile?.company_id,
  });

  return {
    meetings,
    isLoading,
    isAdmin,
  };
};
