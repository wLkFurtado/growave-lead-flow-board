
-- Atualizar o perfil do usuário para admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = '631c205f-b402-4d08-b679-d043293437b8';

-- Padronizar os nomes dos clientes (remover diferenças de maiúscula/minúscula)
UPDATE facebook_ads 
SET cliente_nome = 'Hospital do Cabelo' 
WHERE cliente_nome = 'Hospital do cabelo';

UPDATE whatsapp_anuncio 
SET cliente_nome = 'Hospital do Cabelo' 
WHERE cliente_nome = 'Hospital do cabelo';
