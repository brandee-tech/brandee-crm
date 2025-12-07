-- Create lead_forms table to store form configurations
CREATE TABLE public.lead_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'minimal-light',
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{
    "primaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "buttonText": "Enviar",
    "successMessage": "Obrigado! Entraremos em contato em breve.",
    "title": "Entre em contato",
    "subtitle": "Preencha o formulário abaixo"
  }'::jsonb,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_form_fields table to store form fields
CREATE TABLE public.lead_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.lead_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL DEFAULT 'text',
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  options JSONB DEFAULT '[]'::jsonb,
  maps_to_lead_field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_form_submissions table to track submissions
CREATE TABLE public.lead_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.lead_forms(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_forms
CREATE POLICY "Users can view their company lead forms" 
ON public.lead_forms 
FOR SELECT 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create lead forms for their company" 
ON public.lead_forms 
FOR INSERT 
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company lead forms" 
ON public.lead_forms 
FOR UPDATE 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their company lead forms" 
ON public.lead_forms 
FOR DELETE 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- RLS policies for lead_form_fields
CREATE POLICY "Users can view their company form fields" 
ON public.lead_form_fields 
FOR SELECT 
USING (form_id IN (SELECT id FROM lead_forms WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can manage their company form fields" 
ON public.lead_form_fields 
FOR ALL 
USING (form_id IN (SELECT id FROM lead_forms WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- RLS policies for lead_form_submissions
CREATE POLICY "Users can view their company form submissions" 
ON public.lead_form_submissions 
FOR SELECT 
USING (form_id IN (SELECT id FROM lead_forms WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- Allow public inserts for form submissions (will be done via edge function)
CREATE POLICY "Anyone can submit to active forms" 
ON public.lead_form_submissions 
FOR INSERT 
WITH CHECK (form_id IN (SELECT id FROM lead_forms WHERE is_active = true));

-- Create indexes for performance
CREATE INDEX idx_lead_forms_company_id ON public.lead_forms(company_id);
CREATE INDEX idx_lead_forms_slug ON public.lead_forms(slug);
CREATE INDEX idx_lead_form_fields_form_id ON public.lead_form_fields(form_id);
CREATE INDEX idx_lead_form_submissions_form_id ON public.lead_form_submissions(form_id);

-- Trigger for updated_at
CREATE TRIGGER update_lead_forms_updated_at
BEFORE UPDATE ON public.lead_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();