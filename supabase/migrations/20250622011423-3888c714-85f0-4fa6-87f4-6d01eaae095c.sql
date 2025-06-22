
-- Recriar função is_admin com melhor implementação
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Recriar função get_user_clients com melhor implementação
CREATE OR REPLACE FUNCTION public.get_user_clients(user_id UUID)
RETURNS SETOF TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT cliente_nome FROM public.user_clients 
  WHERE user_clients.user_id = get_user_clients.user_id;
$$;

-- Garantir que RLS está ativo em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_anuncio ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Recriar políticas RLS para user_clients
DROP POLICY IF EXISTS "Users can view their own client associations" ON public.user_clients;

CREATE POLICY "Users can view their own client associations" 
  ON public.user_clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Recriar políticas RLS para facebook_ads
DROP POLICY IF EXISTS "Admin can view all facebook ads" ON public.facebook_ads;
DROP POLICY IF EXISTS "Clients can view their own facebook ads" ON public.facebook_ads;

CREATE POLICY "Admin can view all facebook ads" 
  ON public.facebook_ads 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view their own facebook ads" 
  ON public.facebook_ads 
  FOR SELECT 
  USING (
    NOT public.is_admin(auth.uid()) AND 
    cliente_nome IN (SELECT public.get_user_clients(auth.uid()))
  );

-- Recriar políticas RLS para whatsapp_anuncio
DROP POLICY IF EXISTS "Admin can view all whatsapp leads" ON public.whatsapp_anuncio;
DROP POLICY IF EXISTS "Clients can view their own whatsapp leads" ON public.whatsapp_anuncio;

CREATE POLICY "Admin can view all whatsapp leads" 
  ON public.whatsapp_anuncio 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view their own whatsapp leads" 
  ON public.whatsapp_anuncio 
  FOR SELECT 
  USING (
    NOT public.is_admin(auth.uid()) AND 
    cliente_nome IN (SELECT public.get_user_clients(auth.uid()))
  );
