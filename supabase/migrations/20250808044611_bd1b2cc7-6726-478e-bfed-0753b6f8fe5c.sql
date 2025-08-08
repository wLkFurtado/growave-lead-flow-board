-- Permitir que admins atualizem qualquer lead
CREATE POLICY "Admin can update all whatsapp leads" 
ON public.whatsapp_anuncio 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Permitir que clientes atualizem seus próprios leads
CREATE POLICY "Clients can update their own whatsapp leads" 
ON public.whatsapp_anuncio 
FOR UPDATE 
USING ((NOT is_admin(auth.uid())) AND (cliente_nome IN (SELECT get_user_clients(auth.uid()))));