import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change' 
  | 'transfer' 
  | 'tag_add' 
  | 'tag_remove';

export interface AuditLogEntry {
  id: string;
  lead_id: string;
  company_id: string;
  user_id: string;
  user_name: string | null;
  action: AuditAction;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  change_reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// Mapeamento de nomes de campos para português
const fieldLabels: Record<string, string> = {
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  status: 'Status',
  temperature: 'Temperatura',
  source: 'Origem',
  product_name: 'Produto',
  product_value: 'Valor',
  partner_id: 'Parceiro',
  assigned_to: 'Responsável',
  revenue_generated: 'Receita Gerada',
  revenue_lost: 'Receita Perdida'
};

// Campos que devem ser monitorados para auditoria
const auditableFields = [
  'name', 'email', 'phone', 'status', 'temperature', 
  'source', 'product_name', 'product_value', 'partner_id', 
  'assigned_to', 'revenue_generated', 'revenue_lost'
];

export const useLeadAuditLog = () => {
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();

  // Função auxiliar para inserir log no banco
  const insertAuditLog = useCallback(async (
    leadId: string,
    companyId: string,
    action: AuditAction,
    fieldName?: string | null,
    oldValue?: string | null,
    newValue?: string | null,
    changeReason?: string | null,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_audit_logs')
        .insert({
          lead_id: leadId,
          company_id: companyId,
          user_id: user.id,
          user_name: userInfo?.full_name || user.email || 'Usuário',
          action,
          field_name: fieldName || null,
          old_value: oldValue !== undefined ? String(oldValue ?? '') : null,
          new_value: newValue !== undefined ? String(newValue ?? '') : null,
          change_reason: changeReason || null,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error inserting audit log:', error);
      }
    } catch (error) {
      console.error('Error in insertAuditLog:', error);
    }
  }, [user, userInfo]);

  // Detectar mudanças entre dados antigos e novos
  const detectChanges = (oldData: Record<string, any>, newData: Record<string, any>): FieldChange[] => {
    const changes: FieldChange[] = [];
    
    for (const field of auditableFields) {
      const oldVal = oldData[field];
      const newVal = newData[field];
      
      // Comparar valores (considerando null/undefined como equivalentes)
      const oldNormalized = oldVal ?? null;
      const newNormalized = newVal ?? null;
      
      if (oldNormalized !== newNormalized) {
        changes.push({
          field,
          oldValue: oldNormalized,
          newValue: newNormalized
        });
      }
    }
    
    return changes;
  };

  // Registrar criação de lead
  const logCreate = useCallback(async (
    leadId: string,
    companyId: string,
    leadData: Record<string, any>
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'create',
      null,
      null,
      null,
      null,
      { lead_data: leadData }
    );
  }, [insertAuditLog]);

  // Registrar atualização de lead (detecta automaticamente as mudanças)
  const logUpdate = useCallback(async (
    leadId: string,
    companyId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    changeReason?: string
  ) => {
    const changes = detectChanges(oldData, newData);
    
    if (changes.length === 0) return;

    // Criar um log para cada campo alterado
    for (const change of changes) {
      await insertAuditLog(
        leadId,
        companyId,
        'update',
        change.field,
        change.oldValue,
        change.newValue,
        changeReason,
        { all_changes: changes }
      );
    }
  }, [insertAuditLog]);

  // Registrar mudança de status (específico para drag-n-drop no pipeline)
  const logStatusChange = useCallback(async (
    leadId: string,
    companyId: string,
    oldStatus: string,
    newStatus: string,
    changeReason?: string
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'status_change',
      'status',
      oldStatus,
      newStatus,
      changeReason
    );
  }, [insertAuditLog]);

  // Registrar transferência de lead
  const logTransfer = useCallback(async (
    leadId: string,
    companyId: string,
    oldAssigneeId: string | null,
    newAssigneeId: string | null,
    oldAssigneeName?: string | null,
    newAssigneeName?: string | null,
    changeReason?: string
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'transfer',
      'assigned_to',
      oldAssigneeName || oldAssigneeId || 'Não atribuído',
      newAssigneeName || newAssigneeId || 'Não atribuído',
      changeReason,
      { old_assignee_id: oldAssigneeId, new_assignee_id: newAssigneeId }
    );
  }, [insertAuditLog]);

  // Registrar exclusão de lead
  const logDelete = useCallback(async (
    leadId: string,
    companyId: string,
    leadData: Record<string, any>,
    changeReason?: string
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'delete',
      null,
      leadData.name || 'Lead',
      null,
      changeReason,
      { deleted_data: leadData }
    );
  }, [insertAuditLog]);

  // Registrar adição de tag
  const logTagAdd = useCallback(async (
    leadId: string,
    companyId: string,
    tagName: string,
    tagId: string
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'tag_add',
      'tags',
      null,
      tagName,
      null,
      { tag_id: tagId }
    );
  }, [insertAuditLog]);

  // Registrar remoção de tag
  const logTagRemove = useCallback(async (
    leadId: string,
    companyId: string,
    tagName: string,
    tagId: string
  ) => {
    await insertAuditLog(
      leadId,
      companyId,
      'tag_remove',
      'tags',
      tagName,
      null,
      null,
      { tag_id: tagId }
    );
  }, [insertAuditLog]);

  // Buscar logs de auditoria de um lead
  const getAuditLogs = useCallback(async (leadId: string): Promise<AuditLogEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('lead_audit_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return (data || []) as AuditLogEntry[];
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return [];
    }
  }, []);

  // Função utilitária para obter label do campo
  const getFieldLabel = (field: string): string => {
    return fieldLabels[field] || field;
  };

  return {
    logCreate,
    logUpdate,
    logDelete,
    logStatusChange,
    logTransfer,
    logTagAdd,
    logTagRemove,
    getAuditLogs,
    getFieldLabel,
    detectChanges
  };
};
