-- Create table to link whatsapp conversations to tags
CREATE TABLE IF NOT EXISTS public.whatsapp_conversation_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.lead_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_conversation_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company conversation tag assignments"
  ON public.whatsapp_conversation_tag_assignments
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create conversation tag assignments for their company"
  ON public.whatsapp_conversation_tag_assignments
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their company conversation tag assignments"
  ON public.whatsapp_conversation_tag_assignments
  FOR DELETE
  USING (
    conversation_id IN (
      SELECT id FROM whatsapp_conversations
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Create index for better performance
CREATE INDEX idx_whatsapp_conversation_tag_assignments_conversation ON public.whatsapp_conversation_tag_assignments(conversation_id);
CREATE INDEX idx_whatsapp_conversation_tag_assignments_tag ON public.whatsapp_conversation_tag_assignments(tag_id);