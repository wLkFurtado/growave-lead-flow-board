// Data validation and analysis service

import { FacebookAd, WhatsAppLead } from '@/types/database';
import { ValidationResult } from '@/types/business';
import { validateFacebookAd, validateWhatsAppLead } from '@/utils/data/validators';

export class DataValidationService {
  static validateClientData(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[],
    activeClient: string
  ): ValidationResult {
    // Basic validation
    const fbWithInvestment = facebookAds.filter(row => (row.investimento || 0) > 0);
    const wppWithSales = whatsappLeads.filter(row => (row.valor_venda || 0) > 0);
    
    const totalInvestment = fbWithInvestment.reduce((sum, row) => sum + (row.investimento || 0), 0);
    const totalRevenue = wppWithSales.reduce((sum, row) => sum + (row.valor_venda || 0), 0);
    
    const campaigns = [...new Set(facebookAds.map(row => row.campanha))].filter(Boolean);
    
    const statusDistribution = whatsappLeads.reduce((acc, row) => {
      const status = row.status || 'sem_status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasData = facebookAds.length > 0 || whatsappLeads.length > 0;
    const totalRecords = facebookAds.length + whatsappLeads.length;

    console.log('📊 DataValidationService: Validação para cliente:', `"${activeClient}"`, {
      hasData,
      totalRecords,
      facebook: {
        total: facebookAds.length,
        withInvestment: fbWithInvestment.length,
        totalInvestment
      },
      whatsapp: {
        total: whatsappLeads.length,
        withSales: wppWithSales.length,
        totalRevenue
      }
    });

    return {
      hasData,
      totalRecords,
      facebookStats: {
        total: facebookAds.length,
        withInvestment: fbWithInvestment.length,
        totalInvestment,
        campaigns: campaigns.slice(0, 5) // Limit to 5 campaigns for display
      },
      whatsappStats: {
        total: whatsappLeads.length,
        withSales: wppWithSales.length,
        totalRevenue,
        statusDistribution
      }
    };
  }

  static validateDataIntegrity(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate Facebook Ads
    facebookAds.forEach((ad, index) => {
      const adErrors = validateFacebookAd(ad);
      if (adErrors.length > 0) {
        errors.push(`Facebook Ad ${index + 1}: ${adErrors.join(', ')}`);
      }
    });

    // Validate WhatsApp Leads
    whatsappLeads.forEach((lead, index) => {
      const leadErrors = validateWhatsAppLead(lead);
      if (leadErrors.length > 0) {
        errors.push(`WhatsApp Lead ${index + 1}: ${leadErrors.join(', ')}`);
      }
    });

    // Check for data consistency
    const fbDates = facebookAds.map(ad => ad.data).filter(Boolean);
    const wppDates = whatsappLeads.map(lead => lead.data_criacao).filter(Boolean);

    if (fbDates.length > 0 && wppDates.length > 0) {
      const fbDateRange = {
        min: Math.min(...fbDates.map(d => new Date(d).getTime())),
        max: Math.max(...fbDates.map(d => new Date(d).getTime()))
      };
      
      const wppDateRange = {
        min: Math.min(...wppDates.map(d => new Date(d).getTime())),
        max: Math.max(...wppDates.map(d => new Date(d).getTime()))
      };

      const oneDay = 24 * 60 * 60 * 1000;
      if (Math.abs(fbDateRange.min - wppDateRange.min) > oneDay ||
          Math.abs(fbDateRange.max - wppDateRange.max) > oneDay) {
        warnings.push('Inconsistência nas datas entre Facebook Ads e WhatsApp Leads');
      }
    }

    // Check for missing client associations
    const fbWithoutClient = facebookAds.filter(ad => !ad.cliente_nome);
    const wppWithoutClient = whatsappLeads.filter(lead => !lead.cliente_nome);

    if (fbWithoutClient.length > 0) {
      warnings.push(`${fbWithoutClient.length} anúncios do Facebook sem cliente associado`);
    }

    if (wppWithoutClient.length > 0) {
      warnings.push(`${wppWithoutClient.length} leads do WhatsApp sem cliente associado`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static detectDataAnomalies(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): {
    anomalies: Array<{
      type: 'outlier' | 'missing' | 'inconsistent';
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  } {
    const anomalies: Array<{
      type: 'outlier' | 'missing' | 'inconsistent';
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check for investment outliers
    const investments = facebookAds.map(ad => ad.investimento || 0).filter(inv => inv > 0);
    if (investments.length > 0) {
      const avgInvestment = investments.reduce((sum, inv) => sum + inv, 0) / investments.length;
      const highInvestments = investments.filter(inv => inv > avgInvestment * 5);
      
      if (highInvestments.length > 0) {
        anomalies.push({
          type: 'outlier',
          description: `${highInvestments.length} anúncios com investimento muito acima da média`,
          severity: 'medium'
        });
      }
    }

    // Check for sales outliers
    const salesValues = whatsappLeads.map(lead => lead.valor_venda || 0).filter(val => val > 0);
    if (salesValues.length > 0) {
      const avgSale = salesValues.reduce((sum, val) => sum + val, 0) / salesValues.length;
      const highSales = salesValues.filter(val => val > avgSale * 10);
      
      if (highSales.length > 0) {
        anomalies.push({
          type: 'outlier',
          description: `${highSales.length} vendas com valor muito acima da média`,
          severity: 'low'
        });
      }
    }

    // Check for missing critical data
    const adsWithoutInvestment = facebookAds.filter(ad => !ad.investimento || ad.investimento <= 0);
    if (adsWithoutInvestment.length > facebookAds.length * 0.3) {
      anomalies.push({
        type: 'missing',
        description: 'Mais de 30% dos anúncios não têm dados de investimento',
        severity: 'high'
      });
    }

    const leadsWithoutPhone = whatsappLeads.filter(lead => !lead.telefone);
    if (leadsWithoutPhone.length > 0) {
      anomalies.push({
        type: 'missing',
        description: `${leadsWithoutPhone.length} leads sem telefone`,
        severity: 'high'
      });
    }

    return { anomalies };
  }

  static generateDataHealthReport(
    facebookAds: FacebookAd[],
    whatsappLeads: WhatsAppLead[]
  ): {
    score: number;
    summary: string;
    details: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
    };
  } {
    let completeness = 100;
    let accuracy = 100;
    let consistency = 100;
    let timeliness = 100;

    // Calculate completeness
    const fbMissingFields = facebookAds.reduce((count, ad) => {
      let missing = 0;
      if (!ad.investimento) missing++;
      if (!ad.alcance) missing++;
      if (!ad.impressoes) missing++;
      return count + missing;
    }, 0);

    const wppMissingFields = whatsappLeads.reduce((count, lead) => {
      let missing = 0;
      if (!lead.telefone) missing++;
      if (!lead.nome) missing++;
      return count + missing;
    }, 0);

    const totalPossibleFields = (facebookAds.length * 3) + (whatsappLeads.length * 2);
    if (totalPossibleFields > 0) {
      completeness = Math.max(0, 100 - ((fbMissingFields + wppMissingFields) / totalPossibleFields) * 100);
    }

    // Calculate consistency (date ranges alignment)
    const integrity = this.validateDataIntegrity(facebookAds, whatsappLeads);
    if (integrity.warnings.length > 0) {
      consistency = Math.max(60, 100 - (integrity.warnings.length * 10));
    }

    // Calculate timeliness (data freshness)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentFbAds = facebookAds.filter(ad => new Date(ad.data) > oneWeekAgo);
    const recentLeads = whatsappLeads.filter(lead => new Date(lead.data_criacao) > oneWeekAgo);
    
    if (facebookAds.length > 0 && recentFbAds.length === 0) {
      timeliness -= 30;
    }
    if (whatsappLeads.length > 0 && recentLeads.length === 0) {
      timeliness -= 30;
    }

    const overallScore = (completeness + accuracy + consistency + timeliness) / 4;

    let summary = '';
    if (overallScore >= 90) {
      summary = 'Excelente qualidade dos dados';
    } else if (overallScore >= 70) {
      summary = 'Boa qualidade dos dados com pequenos problemas';
    } else if (overallScore >= 50) {
      summary = 'Qualidade média - requer atenção';
    } else {
      summary = 'Qualidade baixa - necessita correções urgentes';
    }

    return {
      score: Math.round(overallScore),
      summary,
      details: {
        completeness: Math.round(completeness),
        accuracy: Math.round(accuracy),
        consistency: Math.round(consistency),
        timeliness: Math.round(timeliness)
      }
    };
  }
}