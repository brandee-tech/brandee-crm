-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash)
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view keys for their company
CREATE POLICY "Users can view api keys from their company"
  ON public.api_keys
  FOR SELECT
  USING (company_id = get_current_user_company_id());

-- Users can create keys for their company
CREATE POLICY "Users can create api keys for their company"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (
    company_id = get_current_user_company_id()
    AND (created_by = auth.uid() OR created_by IS NULL)
  );

-- Users can update keys for their company (e.g. revoke/deactivate)
CREATE POLICY "Users can update api keys from their company"
  ON public.api_keys
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

-- Users can delete keys for their company
CREATE POLICY "Users can delete api keys from their company"
  ON public.api_keys
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- Indexes
CREATE INDEX api_keys_company_id_idx ON public.api_keys(company_id);
CREATE INDEX api_keys_key_hash_idx ON public.api_keys(key_hash);
