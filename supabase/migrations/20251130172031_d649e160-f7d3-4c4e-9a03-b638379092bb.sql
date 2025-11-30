-- Adicionar coluna user_id à tabela whatsapp_instances
ALTER TABLE whatsapp_instances 
ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Criar índice para busca eficiente por usuário
CREATE INDEX idx_whatsapp_instances_user_id ON whatsapp_instances(user_id);

-- Garantir que cada usuário tenha no máximo uma instância ativa
CREATE UNIQUE INDEX idx_unique_user_instance ON whatsapp_instances(user_id) 
WHERE user_id IS NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN whatsapp_instances.user_id IS 'ID do usuário que possui esta instância de WhatsApp. Cada usuário pode ter apenas uma instância ativa.';