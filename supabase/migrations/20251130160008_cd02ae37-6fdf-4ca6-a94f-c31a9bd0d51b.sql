-- Habilitar REPLICA IDENTITY FULL para as tabelas do WhatsApp
-- (as tabelas já estão na publicação supabase_realtime)

ALTER TABLE public.whatsapp_instances REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_contacts REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;