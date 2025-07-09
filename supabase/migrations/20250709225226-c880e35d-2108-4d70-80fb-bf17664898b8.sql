
-- Adicionar coluna de temperatura na tabela leads
ALTER TABLE public.leads 
ADD COLUMN temperature text DEFAULT 'Frio';

-- Atualizar leads existentes baseado no status atual se for temperatura
UPDATE public.leads 
SET temperature = CASE 
  WHEN status IN ('Quente', 'Morno', 'Frio') THEN status
  ELSE 'Frio'
END;

-- Atualizar leads que tinham temperatura como status para usar "Novo Lead"
UPDATE public.leads 
SET status = 'Novo Lead' 
WHERE status IN ('Quente', 'Morno', 'Frio');
