
-- Renomear as tabelas para nomes mais limpos
ALTER TABLE "[FB] Hospital_do_cabelo" RENAME TO "facebook_ads";
ALTER TABLE "[WPP] Hospital_do_cabelo" RENAME TO "whatsapp_anuncio";

-- Vamos também padronizar o nome da coluna de cliente
ALTER TABLE "facebook_ads" RENAME COLUMN "cliente-name" TO "cliente_nome";
ALTER TABLE "whatsapp_anuncio" RENAME COLUMN "cliente-name" TO "cliente_nome";
