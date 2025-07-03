// Database table interfaces based on Supabase schema

export interface FacebookAd {
  id_data: string;
  data: string;
  campanha: string;
  conjunto_anuncio: string;
  anuncio: string | null;
  cliente_nome: string | null;
  investimento: number | null;
  alcance: number | null;
  frequencia: number | null;
  impressoes: number | null;
  cliques_no_link: number | null;
  mensagens_iniciadas: number | null;
  numero_vis_3s_videoview: number | null;
  numero_vis_25_videoview: number | null;
  numero_vis_50_videoview: number | null;
  numero_vis_75_videoview: number | null;
  numero_vis_95_videoview: number | null;
  id_conta: number | null;
  source_id: string | null;
}

export interface WhatsAppLead {
  telefone: string;
  data_criacao: string;
  nome: string | null;
  sobrenome: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  cliente_nome: string | null;
  valor_venda: number | null;
  status: string | null;
  contact_id: string | null;
  id_transacao: string | null;
  source_id: string | null;
  mensagem: string | null;
  cta: string | null;
  ctwaclid: string | null;
  source_url: string | null;
  nome_anuncio: string | null;
  nome_campanha: string | null;
  nome_conjunto: string | null;
  moeda: string | null;
  plataforma: string | null;
  processado: string | null;
}

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string | null;
  role: string;
}

export interface UserClient {
  id: string;
  user_id: string;
  cliente_nome: string;
  created_at: string;
}