// Business metrics calculation utilities

import { FacebookAd, WhatsAppLead } from '@/types/database';
import { ClientMetrics, Campaign } from '@/types/business';
import { BUSINESS_RULES } from '@/config/business';

export const calculateClientMetrics = (
  facebookAds: FacebookAd[],
  whatsappLeads: WhatsAppLead[]
): ClientMetrics => {
  // Facebook Ads metrics
  const totalInvestido = facebookAds.reduce((sum, ad) => sum + (ad.investimento || 0), 0);
  const totalCliques = facebookAds.reduce((sum, ad) => sum + (ad.cliques_no_link || 0), 0);
  const totalMensagens = facebookAds.reduce((sum, ad) => sum + (ad.mensagens_iniciadas || 0), 0);
  const totalAlcance = facebookAds.reduce((sum, ad) => sum + (ad.alcance || 0), 0);

  // WhatsApp Leads metrics
  const leadsComTelefone = whatsappLeads.filter(lead => 
    lead.telefone && lead.telefone.length >= BUSINESS_RULES.VALID_PHONE_MIN_LENGTH
  );
  const totalLeadsTelefone = leadsComTelefone.length;

  // Sales metrics
  const vendasValidas = whatsappLeads.filter(lead => 
    typeof lead.valor_venda === 'number' && 
    lead.valor_venda >= BUSINESS_RULES.MIN_SALE_VALUE && 
    !isNaN(lead.valor_venda)
  );
  
  const faturamentoMes = vendasValidas.reduce((sum, lead) => sum + (lead.valor_venda || 0), 0);

  // Cost calculations
  const custoPorLeadTelefone = totalLeadsTelefone > 0 && totalInvestido > 0 
    ? totalInvestido / totalLeadsTelefone 
    : 0;
    
  const custoPorMensagemIniciada = totalMensagens > 0 && totalInvestido > 0 
    ? totalInvestido / totalMensagens 
    : 0;

  // ROI calculation
  let roi = 0;
  if (totalInvestido >= BUSINESS_RULES.MIN_INVESTMENT_FOR_ROI && faturamentoMes > 0) {
    roi = ((faturamentoMes - totalInvestido) / totalInvestido) * 100;
  }

  return {
    totalInvestido,
    totalCliques,
    totalMensagens,
    totalLeadsTelefone,
    totalAlcance,
    custoPorLeadTelefone,
    custoPorMensagemIniciada,
    faturamentoMes,
    roi,
    vendasValidas: vendasValidas.length
  };
};

export const calculateCampaignMetrics = (
  facebookAds: FacebookAd[],
  whatsappLeads: WhatsAppLead[]
): Campaign[] => {
  // Group by campaign
  const campaignGroups = facebookAds.reduce((acc, ad) => {
    const campaignName = ad.campanha;
    if (!acc[campaignName]) {
      acc[campaignName] = [];
    }
    acc[campaignName].push(ad);
    return acc;
  }, {} as Record<string, FacebookAd[]>);

  return Object.entries(campaignGroups).map(([name, ads]) => {
    const totalInvestment = ads.reduce((sum, ad) => sum + (ad.investimento || 0), 0);
    
    // Find leads for this campaign
    const campaignLeads = whatsappLeads.filter(lead => 
      lead.nome_campanha === name
    );
    
    const totalLeads = campaignLeads.length;
    const salesLeads = campaignLeads.filter(lead => 
      lead.valor_venda && lead.valor_venda > 0
    );
    const totalSales = salesLeads.reduce((sum, lead) => sum + (lead.valor_venda || 0), 0);
    
    const costPerLead = totalLeads > 0 ? totalInvestment / totalLeads : 0;
    const roi = totalInvestment > 0 ? ((totalSales - totalInvestment) / totalInvestment) * 100 : 0;

    return {
      name,
      totalInvestment,
      totalLeads,
      totalSales,
      costPerLead,
      roi
    };
  }).sort((a, b) => b.totalInvestment - a.totalInvestment);
};

export const calculateConversionRate = (
  leads: number,
  sales: number
): number => {
  if (leads === 0) return 0;
  return (sales / leads) * 100;
};

export const calculateCPM = (investment: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (investment / impressions) * 1000;
};

export const calculateCTR = (clicks: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
};

export const calculateFrequency = (impressions: number, reach: number): number => {
  if (reach === 0) return 0;
  return impressions / reach;
};

export const calculateLifetimeValue = (
  avgOrderValue: number,
  purchaseFrequency: number,
  customerLifespan: number
): number => {
  return avgOrderValue * purchaseFrequency * customerLifespan;
};