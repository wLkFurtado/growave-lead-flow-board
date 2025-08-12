-- Fix data exposure on whatsapp_anuncio by removing permissive policy
BEGIN;

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.whatsapp_anuncio ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policy that exposed data publicly
DROP POLICY IF EXISTS "all" ON public.whatsapp_anuncio;

COMMIT;