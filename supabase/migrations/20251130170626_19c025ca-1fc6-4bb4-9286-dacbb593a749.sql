-- Adicionar políticas RLS para deletar mensagens e conversas do WhatsApp

-- Políticas para whatsapp_messages
DO $$ 
BEGIN
  -- Verificar se a política já existe antes de criar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_messages' 
    AND policyname = 'Users can delete their company whatsapp messages'
  ) THEN
    CREATE POLICY "Users can delete their company whatsapp messages"
    ON whatsapp_messages
    FOR DELETE
    USING (
      company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    );
  END IF;
END $$;

-- Políticas para whatsapp_conversations
DO $$ 
BEGIN
  -- Verificar se a política já existe antes de criar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_conversations' 
    AND policyname = 'Users can delete their company whatsapp conversations'
  ) THEN
    CREATE POLICY "Users can delete their company whatsapp conversations"
    ON whatsapp_conversations
    FOR DELETE
    USING (
      company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    );
  END IF;
END $$;