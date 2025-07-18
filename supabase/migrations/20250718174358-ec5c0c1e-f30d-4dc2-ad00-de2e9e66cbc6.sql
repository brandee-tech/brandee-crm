
-- Criar tabela para armazenar permissões customizadas por empresa
CREATE TABLE public.company_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, role_id)
);

-- Habilitar RLS
ALTER TABLE public.company_role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their company role permissions" 
  ON public.company_role_permissions 
  FOR SELECT 
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage their company role permissions" 
  ON public.company_role_permissions 
  FOR ALL 
  USING (
    is_current_user_admin() AND 
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    is_current_user_admin() AND 
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_role_permissions_updated_at
  BEFORE UPDATE ON public.company_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_company_role_permissions_company_id ON public.company_role_permissions(company_id);
CREATE INDEX idx_company_role_permissions_role_id ON public.company_role_permissions(role_id);
