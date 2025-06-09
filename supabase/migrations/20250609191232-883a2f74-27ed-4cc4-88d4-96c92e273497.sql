
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para associar usuários aos clientes
CREATE TABLE public.user_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cliente_nome)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_anuncio ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
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

-- Função para obter clientes do usuário
CREATE OR REPLACE FUNCTION public.get_user_clients(user_id UUID)
RETURNS SETOF TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT cliente_nome FROM public.user_clients 
  WHERE user_clients.user_id = get_user_clients.user_id;
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas RLS para user_clients
CREATE POLICY "Users can view their own client associations" 
  ON public.user_clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas RLS para facebook_ads
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

-- Políticas RLS para whatsapp_anuncio
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

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email), 
    'client'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
