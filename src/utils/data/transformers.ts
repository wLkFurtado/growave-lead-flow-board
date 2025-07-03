// Data transformation utilities

import { FacebookAd, WhatsAppLead } from '@/types/database';
import { sanitizeString, sanitizePhoneNumber } from './validators';

export const normalizeFacebookAd = (rawAd: any): FacebookAd => {
  return {
    id_data: sanitizeString(rawAd.id_data) || '',
    data: rawAd.data || '',
    campanha: sanitizeString(rawAd.campanha) || '',
    conjunto_anuncio: sanitizeString(rawAd.conjunto_anuncio) || '',
    anuncio: sanitizeString(rawAd.anuncio) || null,
    cliente_nome: sanitizeString(rawAd.cliente_nome) || null,
    investimento: parseFloat(rawAd.investimento) || null,
    alcance: parseInt(rawAd.alcance) || null,
    frequencia: parseFloat(rawAd.frequencia) || null,
    impressoes: parseInt(rawAd.impressoes) || null,
    cliques_no_link: parseInt(rawAd.cliques_no_link) || null,
    mensagens_iniciadas: parseInt(rawAd.mensagens_iniciadas) || null,
    numero_vis_3s_videoview: parseInt(rawAd.numero_vis_3s_videoview) || null,
    numero_vis_25_videoview: parseInt(rawAd.numero_vis_25_videoview) || null,
    numero_vis_50_videoview: parseInt(rawAd.numero_vis_50_videoview) || null,
    numero_vis_75_videoview: parseInt(rawAd.numero_vis_75_videoview) || null,
    numero_vis_95_videoview: parseInt(rawAd.numero_vis_95_videoview) || null,
    id_conta: parseInt(rawAd.id_conta) || null,
    source_id: sanitizeString(rawAd.source_id) || null,
  };
};

export const normalizeWhatsAppLead = (rawLead: any): WhatsAppLead => {
  return {
    telefone: sanitizePhoneNumber(rawLead.telefone) || '',
    data_criacao: rawLead.data_criacao || '',
    nome: sanitizeString(rawLead.nome) || null,
    sobrenome: sanitizeString(rawLead.sobrenome) || null,
    email: sanitizeString(rawLead.email) || null,
    cidade: sanitizeString(rawLead.cidade) || null,
    estado: sanitizeString(rawLead.estado) || null,
    pais: sanitizeString(rawLead.pais) || null,
    cliente_nome: sanitizeString(rawLead.cliente_nome) || null,
    valor_venda: parseFloat(rawLead.valor_venda) || null,
    status: sanitizeString(rawLead.status) || null,
    contact_id: sanitizeString(rawLead.contact_id) || null,
    id_transacao: sanitizeString(rawLead.id_transacao) || null,
    source_id: sanitizeString(rawLead.source_id) || null,
    mensagem: sanitizeString(rawLead.mensagem) || null,
    cta: sanitizeString(rawLead.cta) || null,
    ctwaclid: sanitizeString(rawLead.ctwaclid) || null,
    source_url: sanitizeString(rawLead.source_url) || null,
    nome_anuncio: sanitizeString(rawLead.nome_anuncio) || null,
    nome_campanha: sanitizeString(rawLead.nome_campanha) || null,
    nome_conjunto: sanitizeString(rawLead.nome_conjunto) || null,
    moeda: sanitizeString(rawLead.moeda) || null,
    plataforma: sanitizeString(rawLead.plataforma) || null,
    processado: sanitizeString(rawLead.processado) || null,
  };
};

export const groupByDate = <T extends { data?: string; data_criacao?: string }>(
  data: T[]
): Record<string, T[]> => {
  return data.reduce((acc, item) => {
    const date = item.data || item.data_criacao || '';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const groupByCampaign = (data: FacebookAd[]): Record<string, FacebookAd[]> => {
  return data.reduce((acc, ad) => {
    const campaign = ad.campanha;
    if (!acc[campaign]) {
      acc[campaign] = [];
    }
    acc[campaign].push(ad);
    return acc;
  }, {} as Record<string, FacebookAd[]>);
};

export const groupByStatus = (data: WhatsAppLead[]): Record<string, WhatsAppLead[]> => {
  return data.reduce((acc, lead) => {
    const status = lead.status || 'sem_status';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(lead);
    return acc;
  }, {} as Record<string, WhatsAppLead[]>);
};

export const sortByDate = <T extends { data?: string; data_criacao?: string }>(
  data: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.data || a.data_criacao || '').getTime();
    const dateB = new Date(b.data || b.data_criacao || '').getTime();
    
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const filterByDateRange = <T extends { data?: string; data_criacao?: string }>(
  data: T[],
  from: Date,
  to?: Date
): T[] => {
  const endDate = to || from;
  
  return data.filter(item => {
    const itemDate = new Date(item.data || item.data_criacao || '');
    return itemDate >= from && itemDate <= endDate;
  });
};

export const aggregateByPeriod = (
  data: FacebookAd[],
  period: 'day' | 'week' | 'month'
): Record<string, { investment: number; leads: number; reach: number }> => {
  // Implementation would depend on specific aggregation needs
  return {};
};