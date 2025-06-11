
-- Criar tabela de reuniões
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'Agendada',
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da pauta
CREATE TABLE public.meeting_agendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de atas
CREATE TABLE public.meeting_minutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de anexos
CREATE TABLE public.meeting_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'file', 'image', 'link'
  url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de participantes das reuniões
CREATE TABLE public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'participant', -- 'organizer', 'participant'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para meetings
CREATE POLICY "Users can view meetings from their company"
  ON public.meetings
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Admins can create meetings"
  ON public.meetings
  FOR INSERT
  WITH CHECK (
    company_id = get_current_user_company_id() 
    AND is_current_user_admin()
  );

CREATE POLICY "Admins can update meetings"
  ON public.meetings
  FOR UPDATE
  USING (
    company_id = get_current_user_company_id()
    AND is_current_user_admin()
  );

CREATE POLICY "Admins can delete meetings"
  ON public.meetings
  FOR DELETE
  USING (
    company_id = get_current_user_company_id()
    AND is_current_user_admin()
  );

-- Políticas RLS para meeting_agendas
CREATE POLICY "Users can view agendas from their company meetings"
  ON public.meeting_agendas
  FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

CREATE POLICY "Admins can manage agendas"
  ON public.meeting_agendas
  FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
    AND is_current_user_admin()
  );

-- Políticas RLS para meeting_minutes
CREATE POLICY "Users can view minutes from their company meetings"
  ON public.meeting_minutes
  FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

CREATE POLICY "Users can manage minutes from their company meetings"
  ON public.meeting_minutes
  FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

-- Políticas RLS para meeting_attachments
CREATE POLICY "Users can view attachments from their company meetings"
  ON public.meeting_attachments
  FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

CREATE POLICY "Users can manage attachments from their company meetings"
  ON public.meeting_attachments
  FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

-- Políticas RLS para meeting_participants
CREATE POLICY "Users can view participants from their company meetings"
  ON public.meeting_participants
  FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
  );

CREATE POLICY "Admins can manage participants"
  ON public.meeting_participants
  FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM public.meetings 
      WHERE company_id = get_current_user_company_id()
    )
    AND is_current_user_admin()
  );

-- Criar bucket para anexos de reuniões
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meeting-attachments', 'meeting-attachments', true);

-- Política de storage para anexos
CREATE POLICY "Users can view meeting attachments from their company"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'meeting-attachments'
    AND (storage.foldername(name))[1] = get_current_user_company_id()::text
  );

CREATE POLICY "Users can upload meeting attachments to their company folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'meeting-attachments'
    AND (storage.foldername(name))[1] = get_current_user_company_id()::text
  );

CREATE POLICY "Users can update meeting attachments from their company"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'meeting-attachments'
    AND (storage.foldername(name))[1] = get_current_user_company_id()::text
  );

CREATE POLICY "Users can delete meeting attachments from their company"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'meeting-attachments'
    AND (storage.foldername(name))[1] = get_current_user_company_id()::text
  );
