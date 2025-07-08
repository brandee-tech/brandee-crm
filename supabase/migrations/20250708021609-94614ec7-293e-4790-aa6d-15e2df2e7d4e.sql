-- Adicionar campo meeting_url para appointments
ALTER TABLE public.appointments 
ADD COLUMN meeting_url TEXT;

-- Adicionar campo meeting_url para follow_ups
ALTER TABLE public.follow_ups 
ADD COLUMN meeting_url TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.appointments.meeting_url IS 'URL da reunião online (Meet, Zoom, etc.)';
COMMENT ON COLUMN public.follow_ups.meeting_url IS 'URL da reunião online para follow-up (Meet, Zoom, etc.)';