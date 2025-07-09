-- Primeiro, remover a constraint existente
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_partner_id_fkey;

-- Recriar a constraint com ON DELETE SET NULL
ALTER TABLE public.students 
ADD CONSTRAINT students_partner_id_fkey 
FOREIGN KEY (partner_id) 
REFERENCES public.partners(id) 
ON DELETE SET NULL;