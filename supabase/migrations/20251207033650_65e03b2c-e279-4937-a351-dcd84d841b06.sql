-- Create lead_audit_logs table for tracking all changes to leads
CREATE TABLE public.lead_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  
  -- Tipo de ação
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'status_change', 'transfer', 'tag_add', 'tag_remove'
  
  -- Detalhes da mudança
  field_name TEXT, -- Nome do campo alterado (para updates)
  old_value TEXT, -- Valor anterior
  new_value TEXT, -- Novo valor
  
  -- Razão da mudança (opcional)
  change_reason TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais (ex: todas as mudanças de um update)
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_lead_audit_logs_lead_id ON public.lead_audit_logs(lead_id);
CREATE INDEX idx_lead_audit_logs_company_id ON public.lead_audit_logs(company_id);
CREATE INDEX idx_lead_audit_logs_created_at ON public.lead_audit_logs(created_at DESC);
CREATE INDEX idx_lead_audit_logs_action ON public.lead_audit_logs(action);

-- Enable RLS
ALTER TABLE public.lead_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company audit logs" 
  ON public.lead_audit_logs 
  FOR SELECT 
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create audit logs for their company" 
  ON public.lead_audit_logs 
  FOR INSERT 
  WITH CHECK (company_id = get_current_user_company_id());