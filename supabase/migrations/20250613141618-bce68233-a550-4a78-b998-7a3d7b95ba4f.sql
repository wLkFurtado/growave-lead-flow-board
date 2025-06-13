
-- 1. Função para detectar e corrigir datas mal formatadas
CREATE OR REPLACE FUNCTION public.fix_date_format(input_date date)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Se o "mês" (na verdade dia) for maior que 12, precisa trocar
    IF EXTRACT(MONTH FROM input_date) > 12 THEN
        -- Reconstrói a data trocando mês e dia de posição
        RETURN (EXTRACT(YEAR FROM input_date)::text || '-' || 
                LPAD(EXTRACT(DAY FROM input_date)::text, 2, '0') || '-' || 
                LPAD(EXTRACT(MONTH FROM input_date)::text, 2, '0'))::date;
    END IF;
    
    -- Se está no formato correto, retorna como está
    RETURN input_date;
END;
$$;

-- 2. Corrigir todas as datas existentes na tabela whatsapp_anuncio
UPDATE whatsapp_anuncio 
SET data_criacao = public.fix_date_format(data_criacao)
WHERE EXTRACT(MONTH FROM data_criacao) > 12;

-- 3. Criar trigger function para corrigir datas automaticamente em inserções e atualizações
CREATE OR REPLACE FUNCTION public.trigger_fix_whatsapp_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Corrige a data antes de inserir/atualizar
    NEW.data_criacao := public.fix_date_format(NEW.data_criacao);
    RETURN NEW;
END;
$$;

-- 4. Criar o trigger que será executado antes de INSERT e UPDATE
DROP TRIGGER IF EXISTS fix_whatsapp_date_trigger ON whatsapp_anuncio;

CREATE TRIGGER fix_whatsapp_date_trigger
    BEFORE INSERT OR UPDATE OF data_criacao
    ON whatsapp_anuncio
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_fix_whatsapp_date();

-- 5. Verificar se as correções foram aplicadas corretamente
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN EXTRACT(MONTH FROM data_criacao) > 12 THEN 1 END) as datas_ainda_incorretas,
    MIN(data_criacao) as data_mais_antiga,
    MAX(data_criacao) as data_mais_recente
FROM whatsapp_anuncio;
