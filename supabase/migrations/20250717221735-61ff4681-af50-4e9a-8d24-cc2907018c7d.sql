-- Remove roles duplicados antigos (não system roles)
-- Primeiro, atualizar usuários que estão usando os roles antigos para os novos system roles
UPDATE profiles 
SET role_id = (
  SELECT id FROM roles 
  WHERE name = 'Administrador' AND is_system_role = true 
  LIMIT 1
)
WHERE role_id IN (
  SELECT id FROM roles 
  WHERE name = 'Administrador' AND is_system_role = false
);

UPDATE profiles 
SET role_id = (
  SELECT id FROM roles 
  WHERE name = 'Vendedor' AND is_system_role = true 
  LIMIT 1
)
WHERE role_id IN (
  SELECT id FROM roles 
  WHERE name = 'Vendedor' AND is_system_role = false
);

-- Atualizar usuários com roles que não existem mais para SDR
UPDATE profiles 
SET role_id = (
  SELECT id FROM roles 
  WHERE name = 'SDR' AND is_system_role = true 
  LIMIT 1
)
WHERE role_id IN (
  SELECT id FROM roles 
  WHERE name IN ('Gerente', 'Usuário') AND is_system_role = false
);

-- Agora deletar os roles duplicados/antigos (não system roles)
DELETE FROM roles 
WHERE is_system_role = false;