import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLeadAuditLog } from '@/hooks/useLeadAuditLog';

export interface DuplicateLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  temperature: string | null;
  product_name: string | null;
  product_value: number | null;
  created_at: string;
  updated_at: string;
  company_id: string;
  assigned_to: string | null;
  partner_id: string | null;
}

export interface DuplicateGroup {
  key: string;
  matchType: 'phone' | 'email' | 'name';
  leads: DuplicateLead[];
}

export const useDuplicateLeads = () => {
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { logCreate, logDelete } = useLeadAuditLog();

  // Normalizar telefone para comparação
  const normalizePhone = (phone: string | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(-9); // Últimos 9 dígitos
  };

  // Normalizar email para comparação
  const normalizeEmail = (email: string | null): string => {
    if (!email) return '';
    return email.toLowerCase().trim();
  };

  // Normalizar nome para comparação
  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Buscar leads duplicados
  const findDuplicates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar company_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Usuário não possui empresa associada');
      }

      // Buscar todos os leads da empresa
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', profileData.company_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groups: DuplicateGroup[] = [];
      const processedIds = new Set<string>();

      // Agrupar por telefone
      const phoneGroups = new Map<string, DuplicateLead[]>();
      leads?.forEach(lead => {
        const normalizedPhone = normalizePhone(lead.phone);
        if (normalizedPhone && normalizedPhone.length >= 8) {
          const existing = phoneGroups.get(normalizedPhone) || [];
          existing.push(lead);
          phoneGroups.set(normalizedPhone, existing);
        }
      });

      phoneGroups.forEach((groupLeads, phone) => {
        if (groupLeads.length > 1) {
          groupLeads.forEach(l => processedIds.add(l.id));
          groups.push({
            key: `phone-${phone}`,
            matchType: 'phone',
            leads: groupLeads
          });
        }
      });

      // Agrupar por email (apenas leads não processados)
      const emailGroups = new Map<string, DuplicateLead[]>();
      leads?.forEach(lead => {
        if (processedIds.has(lead.id)) return;
        const normalizedEmail = normalizeEmail(lead.email);
        if (normalizedEmail) {
          const existing = emailGroups.get(normalizedEmail) || [];
          existing.push(lead);
          emailGroups.set(normalizedEmail, existing);
        }
      });

      emailGroups.forEach((groupLeads, email) => {
        if (groupLeads.length > 1) {
          groupLeads.forEach(l => processedIds.add(l.id));
          groups.push({
            key: `email-${email}`,
            matchType: 'email',
            leads: groupLeads
          });
        }
      });

      // Agrupar por nome (apenas leads não processados)
      const nameGroups = new Map<string, DuplicateLead[]>();
      leads?.forEach(lead => {
        if (processedIds.has(lead.id)) return;
        const normalizedName = normalizeName(lead.name);
        if (normalizedName && normalizedName.length > 2) {
          const existing = nameGroups.get(normalizedName) || [];
          existing.push(lead);
          nameGroups.set(normalizedName, existing);
        }
      });

      nameGroups.forEach((groupLeads, name) => {
        if (groupLeads.length > 1) {
          groups.push({
            key: `name-${name}`,
            matchType: 'name',
            leads: groupLeads
          });
        }
      });

      setDuplicateGroups(groups);

      if (groups.length === 0) {
        toast({
          title: "Nenhuma duplicata encontrada",
          description: "Não foram encontrados leads duplicados na sua base."
        });
      } else {
        toast({
          title: "Duplicatas encontradas",
          description: `Encontrados ${groups.length} grupo(s) de leads duplicados.`
        });
      }
    } catch (error) {
      console.error('Erro ao buscar duplicatas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar leads duplicados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Mesclar leads duplicados
  const mergeLeads = useCallback(async (
    primaryLeadId: string,
    secondaryLeadIds: string[],
    groupKey: string
  ) => {
    if (!user) return;

    setMerging(true);
    try {
      // Buscar dados de todos os leads
      const { data: allLeads, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .in('id', [primaryLeadId, ...secondaryLeadIds]);

      if (fetchError) throw fetchError;

      const primaryLead = allLeads?.find(l => l.id === primaryLeadId);
      const secondaryLeads = allLeads?.filter(l => secondaryLeadIds.includes(l.id)) || [];

      if (!primaryLead) throw new Error('Lead principal não encontrado');

      // Mesclar dados: priorizar dados do lead principal, mas preencher campos vazios com dados dos secundários
      const mergedData: Partial<DuplicateLead> = {
        name: primaryLead.name,
        email: primaryLead.email,
        phone: primaryLead.phone,
        status: primaryLead.status,
        source: primaryLead.source,
        temperature: primaryLead.temperature,
        product_name: primaryLead.product_name,
        product_value: primaryLead.product_value,
        assigned_to: primaryLead.assigned_to,
        partner_id: primaryLead.partner_id
      };

      // Preencher campos vazios com dados dos leads secundários
      for (const secondary of secondaryLeads) {
        if (!mergedData.email && secondary.email) mergedData.email = secondary.email;
        if (!mergedData.phone && secondary.phone) mergedData.phone = secondary.phone;
        if (!mergedData.source && secondary.source) mergedData.source = secondary.source;
        if (!mergedData.product_name && secondary.product_name) mergedData.product_name = secondary.product_name;
        if (!mergedData.product_value && secondary.product_value) mergedData.product_value = secondary.product_value;
        if (!mergedData.assigned_to && secondary.assigned_to) mergedData.assigned_to = secondary.assigned_to;
        if (!mergedData.partner_id && secondary.partner_id) mergedData.partner_id = secondary.partner_id;
        // Manter temperatura mais quente
        if (secondary.temperature === 'Quente' && mergedData.temperature !== 'Quente') {
          mergedData.temperature = 'Quente';
        } else if (secondary.temperature === 'Morno' && mergedData.temperature === 'Frio') {
          mergedData.temperature = 'Morno';
        }
        // Somar valores de produto
        if (secondary.product_value && mergedData.product_value) {
          mergedData.product_value = (mergedData.product_value || 0) + secondary.product_value;
        }
      }

      // Atualizar lead principal com dados mesclados
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          ...mergedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', primaryLeadId);

      if (updateError) throw updateError;

      // Transferir appointments dos leads secundários para o principal
      for (const secondaryId of secondaryLeadIds) {
        await supabase
          .from('appointments')
          .update({ lead_id: primaryLeadId })
          .eq('lead_id', secondaryId);
      }

      // Transferir tags dos leads secundários para o principal
      for (const secondaryId of secondaryLeadIds) {
        const { data: secondaryTags } = await supabase
          .from('lead_tag_assignments')
          .select('tag_id')
          .eq('lead_id', secondaryId);

        if (secondaryTags && secondaryTags.length > 0) {
          // Verificar tags que já existem no lead principal
          const { data: existingTags } = await supabase
            .from('lead_tag_assignments')
            .select('tag_id')
            .eq('lead_id', primaryLeadId);

          const existingTagIds = new Set(existingTags?.map(t => t.tag_id) || []);

          for (const tag of secondaryTags) {
            if (!existingTagIds.has(tag.tag_id)) {
              await supabase
                .from('lead_tag_assignments')
                .insert({ lead_id: primaryLeadId, tag_id: tag.tag_id });
            }
          }
        }
      }

      // Registrar log de auditoria
      for (const secondaryId of secondaryLeadIds) {
        const secondaryLead = secondaryLeads.find(l => l.id === secondaryId);
        if (secondaryLead) {
          await logDelete(secondaryId, primaryLead.company_id, secondaryLead, `Mesclado com lead ${primaryLead.name}`);
        }
      }

      // Deletar leads secundários
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', secondaryLeadIds);

      if (deleteError) throw deleteError;

      // Remover grupo da lista
      setDuplicateGroups(prev => prev.filter(g => g.key !== groupKey));

      toast({
        title: "Leads mesclados",
        description: `${secondaryLeadIds.length + 1} leads foram mesclados em um único registro.`
      });
    } catch (error) {
      console.error('Erro ao mesclar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mesclar os leads",
        variant: "destructive"
      });
    } finally {
      setMerging(false);
    }
  }, [user, toast, logDelete]);

  // Ignorar grupo de duplicatas
  const ignoreGroup = useCallback((groupKey: string) => {
    setDuplicateGroups(prev => prev.filter(g => g.key !== groupKey));
  }, []);

  return {
    loading,
    merging,
    duplicateGroups,
    findDuplicates,
    mergeLeads,
    ignoreGroup
  };
};
