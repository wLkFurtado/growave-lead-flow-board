-- Adicionar associações de clientes para o usuário admin
INSERT INTO public.user_clients (user_id, cliente_nome)
VALUES 
  ('631c205f-b402-4d08-b679-d043293437b8', 'Hospital do Cabelo'),
  ('631c205f-b402-4d08-b679-d043293437b8', 'Simone Mendes')
ON CONFLICT (user_id, cliente_nome) DO NOTHING;