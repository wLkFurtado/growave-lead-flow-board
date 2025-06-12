
-- Corrigir o formato das datas na tabela whatsapp_anuncio
-- Converter de YYYY-DD-MM para YYYY-MM-DD (trocando dia e mês de posição)
UPDATE whatsapp_anuncio 
SET data_criacao = (
  EXTRACT(YEAR FROM data_criacao)::text || '-06-' || 
  CASE 
    WHEN EXTRACT(MONTH FROM data_criacao) < 10 
    THEN '0' || EXTRACT(MONTH FROM data_criacao)::text
    ELSE EXTRACT(MONTH FROM data_criacao)::text
  END
)::date
WHERE EXTRACT(YEAR FROM data_criacao) = 2025 
  AND EXTRACT(DAY FROM data_criacao) = 6;
