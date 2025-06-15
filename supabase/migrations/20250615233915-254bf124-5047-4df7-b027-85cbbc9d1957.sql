
-- Criar as políticas RLS de INSERT faltantes para user_clients
CREATE POLICY "Users can insert their own client associations" 
  ON public.user_clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Permitir que admins insiram associações para qualquer usuário
CREATE POLICY "Admins can insert client associations for any user" 
  ON public.user_clients 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));
