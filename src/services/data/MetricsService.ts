// Business metrics calculation service

import { FacebookAd, WhatsAppLead } from '@/types/database';
import { ClientMetrics, Campaign } from '@/types/business';
import { 
  calculateClientMetrics, 
  calculateCampaignMetrics,
  calculateConversionRate,
  calculateCPM,
  calculateCTR
} from '@/utils/data/calculators';

export class MetricsService {
  static calculateForClient(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): ClientMetrics {
    return calculateClientMetrics(facebookAds, whatsappLeads);
  }

  static calculateCampaignPerformance(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): Campaign[] {
    return calculateCampaignMetrics(facebookAds, whatsappLeads);
  }

  static calculateAdvancedMetrics(facebookAds: FacebookAd[]) {
    const totalInvestment = facebookAds.reduce((sum, ad) => sum + (ad.investimento || 0), 0);
    const totalImpressions = facebookAds.reduce((sum, ad) => sum + (ad.impressoes || 0), 0);
    const totalClicks = facebookAds.reduce((sum, ad) => sum + (ad.cliques_no_link || 0), 0);
    const totalReach = facebookAds.reduce((sum, ad) => sum + (ad.alcance || 0), 0);

    return {
      cpm: calculateCPM(totalInvestment, totalImpressions),
      ctr: calculateCTR(totalClicks, totalImpressions),
      frequency: totalReach > 0 ? totalImpressions / totalReach : 0,
      costPerClick: totalClicks > 0 ? totalInvestment / totalClicks : 0,
      reachEfficiency: totalImpressions > 0 ? totalReach / totalImpressions : 0
    };
  }

  static calculateTrendMetrics(
    currentData: { facebookAds: FacebookAd[]; whatsappLeads: WhatsAppLead[] },
    previousData: { facebookAds: FacebookAd[]; whatsappLeads: WhatsAppLead[] }
  ) {
    const currentMetrics = this.calculateForClient(currentData.facebookAds, currentData.whatsappLeads);
    const previousMetrics = this.calculateForClient(previousData.facebookAds, previousData.whatsappLeads);

    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      investmentChange: calculatePercentageChange(currentMetrics.totalInvestido, previousMetrics.totalInvestido),
      leadsChange: calculatePercentageChange(currentMetrics.totalLeadsTelefone, previousMetrics.totalLeadsTelefone),
      revenueChange: calculatePercentageChange(currentMetrics.faturamentoMes, previousMetrics.faturamentoMes),
      roiChange: calculatePercentageChange(currentMetrics.roi, previousMetrics.roi),
      costPerLeadChange: calculatePercentageChange(currentMetrics.custoPorLeadTelefone, previousMetrics.custoPorLeadTelefone)
    };
  }

  static calculateMonthlyBreakdown(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): Record<string, ClientMetrics> {
    // Group data by month
    const adsByMonth = facebookAds.reduce((acc, ad) => {
      const month = ad.data.substring(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = [];
      acc[month].push(ad);
      return acc;
    }, {} as Record<string, FacebookAd[]>);

    const leadsByMonth = whatsappLeads.reduce((acc, lead) => {
      const month = lead.data_criacao.substring(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = [];
      acc[month].push(lead);
      return acc;
    }, {} as Record<string, WhatsAppLead[]>);

    // Calculate metrics for each month
    const allMonths = new Set([...Object.keys(adsByMonth), ...Object.keys(leadsByMonth)]);
    
    return Array.from(allMonths).reduce((acc, month) => {
      acc[month] = this.calculateForClient(
        adsByMonth[month] || [],
        leadsByMonth[month] || []
      );
      return acc;
    }, {} as Record<string, ClientMetrics>);
  }

  static getTopPerformingCampaigns(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[],
    limit: number = 5
  ): Campaign[] {
    const campaigns = this.calculateCampaignPerformance(facebookAds, whatsappLeads);
    return campaigns
      .sort((a, b) => b.roi - a.roi)
      .slice(0, limit);
  }

  static calculateDataQualityScore(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check Facebook Ads data quality
    const adsWithoutInvestment = facebookAds.filter(ad => !ad.investimento || ad.investimento <= 0);
    if (adsWithoutInvestment.length > 0) {
      score -= 10;
      issues.push(`${adsWithoutInvestment.length} anúncios sem dados de investimento`);
      recommendations.push('Verifique os dados de investimento dos anúncios');
    }

    const adsWithoutReach = facebookAds.filter(ad => !ad.alcance || ad.alcance <= 0);
    if (adsWithoutReach.length > 0) {
      score -= 5;
      issues.push(`${adsWithoutReach.length} anúncios sem dados de alcance`);
    }

    // Check WhatsApp Leads data quality
    const leadsWithoutPhone = whatsappLeads.filter(lead => !lead.telefone);
    if (leadsWithoutPhone.length > 0) {
      score -= 15;
      issues.push(`${leadsWithoutPhone.length} leads sem telefone`);
      recommendations.push('Leads sem telefone não podem ser contatados');
    }

    const leadsWithoutName = whatsappLeads.filter(lead => !lead.nome);
    if (leadsWithoutName.length > 0) {
      score -= 5;
      issues.push(`${leadsWithoutName.length} leads sem nome`);
    }

    // Check data relationships
    const uniqueCampaigns = new Set(facebookAds.map(ad => ad.campanha));
    const leadsWithCampaigns = whatsappLeads.filter(lead => lead.nome_campanha);
    const matchingCampaigns = leadsWithCampaigns.filter(lead => 
      uniqueCampaigns.has(lead.nome_campanha!)
    );

    if (leadsWithCampaigns.length > 0 && matchingCampaigns.length / leadsWithCampaigns.length < 0.8) {
      score -= 10;
      issues.push('Baixa correspondência entre campanhas do Facebook e leads do WhatsApp');
      recommendations.push('Verifique a configuração de tracking entre Facebook Ads e WhatsApp');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}