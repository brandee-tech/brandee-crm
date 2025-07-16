import { supabase } from '@/integrations/supabase/client';

/**
 * Apply role-based filtering to a Supabase query for leads (DEPRECATED - use filterLeadsByRole instead)
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
  console.warn('applyRoleBasedLeadFilter is deprecated, use filterLeadsByRole instead');
  // Simplificar - apenas aplicar filtro por empresa
  return query.eq('company_id', companyId);
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