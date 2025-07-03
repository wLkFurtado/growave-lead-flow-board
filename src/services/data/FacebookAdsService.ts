// Facebook Ads data service

import { supabase } from '@/integrations/supabase/client';
import { FacebookAd } from '@/types/database';
import { DataFetchOptions, ErrorResponse } from '@/types/api';
import { TABLE_NAMES } from '@/config/database';
import { normalizeFacebookAd } from '@/utils/data/transformers';
import { validateClientName, isWithinDateRange } from '@/utils/data/validators';

export class FacebookAdsService {
  static async fetchByClient(options: DataFetchOptions): Promise<FacebookAd[]> {
    const { activeClient, dateRange, skipDateFilter = false } = options;

    if (!validateClientName(activeClient)) {
      throw new Error('Nome do cliente inválido');
    }

    try {
      console.log('🔄 FacebookAdsService: Buscando dados para:', `"${activeClient}"`);

      let query = supabase
        .from(TABLE_NAMES.FACEBOOK_ADS)
        .select('*')
        .eq('cliente_nome', activeClient)
        .order('data', { ascending: false });

      // Apply date filter if needed
      if (!skipDateFilter && dateRange) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
        
        console.log('📅 FacebookAdsService: Aplicando filtro de data:', {
          from: fromDate,
          to: toDate,
          cliente: activeClient
        });
        
        query = query.gte('data', fromDate).lte('data', toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ FacebookAdsService: Erro:', error);
        throw new Error(`Erro Facebook Ads: ${error.message}`);
      }

      const normalizedData = (data || []).map(normalizeFacebookAd);
      
      // Security validation - ensure data belongs to correct client
      const invalidData = normalizedData.filter(row => row.cliente_nome !== activeClient);
      if (invalidData.length > 0) {
        console.error('🚨 VAZAMENTO DE DADOS FB DETECTADO:', {
          invalidCount: invalidData.length,
          expectedClient: activeClient
        });
        throw new Error('Erro de segurança: dados de outros clientes detectados');
      }

      console.log('✅ FacebookAdsService: Dados validados:', {
        cliente: `"${activeClient}"`,
        total: normalizedData.length,
        comInvestimento: normalizedData.filter(row => (row.investimento || 0) > 0).length
      });

      return normalizedData;

    } catch (error: any) {
      console.error('❌ FacebookAdsService: Erro fatal:', error);
      throw error;
    }
  }

  static async fetchCampaigns(activeClient: string): Promise<string[]> {
    if (!validateClientName(activeClient)) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FACEBOOK_ADS)
        .select('campanha')
        .eq('cliente_nome', activeClient)
        .not('campanha', 'is', null);

      if (error) {
        console.error('❌ FacebookAdsService: Erro ao buscar campanhas:', error);
        return [];
      }

      const campaigns = [...new Set(data.map(row => row.campanha))].filter(Boolean);
      return campaigns.sort();

    } catch (error) {
      console.error('❌ FacebookAdsService: Erro ao buscar campanhas:', error);
      return [];
    }
  }

  static async fetchByDateRange(
    activeClient: string, 
    from: Date, 
    to?: Date
  ): Promise<FacebookAd[]> {
    return this.fetchByClient({
      activeClient,
      dateRange: { from, to },
      skipDateFilter: false
    });
  }

  static async getInvestmentSummary(activeClient: string): Promise<{
    total: number;
    byMonth: Record<string, number>;
  }> {
    try {
      const data = await this.fetchByClient({ 
        activeClient, 
        skipDateFilter: true 
      });

      const total = data.reduce((sum, ad) => sum + (ad.investimento || 0), 0);
      
      const byMonth = data.reduce((acc, ad) => {
        const month = ad.data.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + (ad.investimento || 0);
        return acc;
      }, {} as Record<string, number>);

      return { total, byMonth };

    } catch (error) {
      console.error('❌ FacebookAdsService: Erro ao calcular resumo:', error);
      return { total: 0, byMonth: {} };
    }
  }
}