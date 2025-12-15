-- Create storage bucket for lead form assets (logos and banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-form-assets', 'lead-form-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for lead form assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-form-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload lead form assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead-form-assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update lead form assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lead-form-assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete lead form assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead-form-assets' AND auth.role() = 'authenticated');