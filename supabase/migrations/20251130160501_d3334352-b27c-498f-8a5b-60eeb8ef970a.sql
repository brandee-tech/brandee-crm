-- Criar bucket para avatares do WhatsApp
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-avatars', 'whatsapp-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir leitura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for whatsapp avatars'
  ) THEN
    CREATE POLICY "Public read access for whatsapp avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'whatsapp-avatars');
  END IF;
END $$;

-- Política para permitir upload via service role (edge functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Service role can upload whatsapp avatars'
  ) THEN
    CREATE POLICY "Service role can upload whatsapp avatars"
    ON storage.objects FOR INSERT
    TO service_role
    WITH CHECK (bucket_id = 'whatsapp-avatars');
  END IF;
END $$;

-- Política para permitir update via service role (para upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Service role can update whatsapp avatars'
  ) THEN
    CREATE POLICY "Service role can update whatsapp avatars"
    ON storage.objects FOR UPDATE
    TO service_role
    USING (bucket_id = 'whatsapp-avatars');
  END IF;
END $$;