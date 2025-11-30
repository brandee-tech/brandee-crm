-- Criar bucket para mídias do WhatsApp
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública
CREATE POLICY "Public read access for whatsapp media"
ON storage.objects FOR SELECT
USING (bucket_id = 'whatsapp-media');

-- Política para upload por usuários autenticados
CREATE POLICY "Authenticated users can upload whatsapp media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Política para deletar próprios arquivos
CREATE POLICY "Users can delete their whatsapp media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'whatsapp-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);