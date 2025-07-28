-- Criar bucket para anexos de reunião se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meeting-attachments', 'meeting-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket meeting-attachments
CREATE POLICY "Meeting attachments are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meeting-attachments');

CREATE POLICY "Users can upload meeting attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'meeting-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their meeting attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'meeting-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their meeting attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'meeting-attachments' AND auth.uid() IS NOT NULL);

-- Adicionar campo de presença para participantes de reunião
ALTER TABLE public.meeting_participants 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT NULL;

-- Adicionar campos de data e hora de verificação de presença
ALTER TABLE public.meeting_participants 
ADD COLUMN IF NOT EXISTS attendance_marked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.meeting_participants 
ADD COLUMN IF NOT EXISTS attendance_marked_by UUID REFERENCES public.profiles(id) DEFAULT NULL;