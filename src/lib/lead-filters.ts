import { supabase } from '@/integrations/supabase/client';

/**
 * Apply role-based filtering to a Supabase query for leads
 * @param query - The base Supabase query builder
 * @param userId - The current user's ID
 * @param companyId - The user's company ID
 * @returns The filtered query builder
 */
export const applyRoleBasedLeadFilter = async (
  query: any,
  userId: string,
  companyId: string
) => {
  try {
    // Buscar o role do usuário
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select(`
        id,
        roles(name)
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      return query.eq('company_id', companyId);
    }

    const userRole = userProfile?.roles?.name;
    console.log('Applying role-based filter for role:', userRole);

    // Aplicar filtro baseado no role
    if (userRole === 'Closer') {
      // Closers veem leads atribuídos a eles OU leads não-atribuídos (para poderem assumir)
      return query
        .eq('company_id', companyId)
        .or(`assigned_to.eq.${userId},assigned_to.is.null`);
    } else {
      // Admins, SDRs e outros roles veem todos os leads da empresa
      return query.eq('company_id', companyId);
    }
  } catch (error) {
    console.error('Error applying role-based filter:', error);
    // Em caso de erro, retornar query básica por empresa
    return query.eq('company_id', companyId);
  }
};

/**
 * Filter leads array based on user role
 * @param leads - Array of leads to filter
 * @param userId - The current user's ID
 * @param userRole - The user's role name
 * @returns Filtered array of leads
 */
export const filterLeadsByRole = (
  leads: any[],
  userId: string,
  userRole: string | null
): any[] => {
  if (userRole === 'Closer') {
    // Closers veem leads atribuídos a eles OU leads não-atribuídos (para poderem assumir)
    return leads.filter(lead => lead.assigned_to === userId || lead.assigned_to === null);
  }
  
  // Admins, SDRs e outros roles veem todos os leads
  return leads;
};