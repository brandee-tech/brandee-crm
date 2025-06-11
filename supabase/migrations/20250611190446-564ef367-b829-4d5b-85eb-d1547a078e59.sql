
-- Criar bucket de storage para assets da empresa
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket company-assets
CREATE POLICY "Allow authenticated users to upload company assets"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'company-assets');

CREATE POLICY "Allow public access to company assets"
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'company-assets');

CREATE POLICY "Allow authenticated users to update company assets"
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'company-assets');

CREATE POLICY "Allow authenticated users to delete company assets"
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'company-assets');

-- Verificar se RLS já está habilitado e habilitar se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Política para atualizar empresas (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND policyname = 'Users can update their own company'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update their own company"
        ON public.companies FOR UPDATE 
        TO authenticated 
        USING (id = public.get_current_user_company_id())';
    END IF;
END
$$;
