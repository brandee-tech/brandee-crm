-- Criar função para incrementar contador de mensagens não lidas atomicamente
CREATE OR REPLACE FUNCTION increment_unread_count(conversation_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE whatsapp_conversations 
  SET unread_count = unread_count + 1,
      updated_at = now()
  WHERE id = conversation_uuid;
END;
$$;