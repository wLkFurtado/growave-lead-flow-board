// WhatsApp Leads data service

import { supabase } from '@/integrations/supabase/client';
import { WhatsAppLead } from '@/types/database';
import { DataFetchOptions } from '@/types/api';
import { TABLE_NAMES } from '@/config/database';
import { normalizeWhatsAppLead } from '@/utils/data/transformers';
import { validateClientName, validatePhoneNumber } from '@/utils/data/validators';
import { LEAD_STATUSES } from '@/config/business';

export class WhatsAppLeadsService {
  static async fetchByClient(options: DataFetchOptions): Promise<WhatsAppLead[]> {
    const { activeClient, dateRange, skipDateFilter = false } = options;

    if (!validateClientName(activeClient)) {
      throw new Error('Nome do cliente inválido');
    }

    try {
      console.log('🔄 WhatsAppLeadsService: Buscando dados para:', `"${activeClient}"`);

      let query = supabase
        .from(TABLE_NAMES.WHATSAPP_ANUNCIO)
        .select('*')
        .eq('cliente_nome', activeClient)
        .not('telefone', 'is', null)
        .neq('telefone', '')
        .order('data_criacao', { ascending: false });

      // Apply date filter if needed
      if (!skipDateFilter && dateRange) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
        
        console.log('📅 WhatsAppLeadsService: Aplicando filtro de data:', {
          from: fromDate,
          to: toDate,
          cliente: activeClient
        });
        
        query = query.gte('data_criacao', fromDate).lte('data_criacao', toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ WhatsAppLeadsService: Erro:', error);
        throw new Error(`Erro WhatsApp Leads: ${error.message}`);
      }

      const normalizedData = (data || []).map(normalizeWhatsAppLead);
      
      // Security validation - ensure data belongs to correct client
      const invalidData = normalizedData.filter(row => row.cliente_nome !== activeClient);
      if (invalidData.length > 0) {
        console.error('🚨 VAZAMENTO DE DADOS WPP DETECTADO:', {
          invalidCount: invalidData.length,
          expectedClient: activeClient
        });
        throw new Error('Erro de segurança: dados de outros clientes detectados');
      }

      console.log('✅ WhatsAppLeadsService: Dados validados:', {
        cliente: `"${activeClient}"`,
        total: normalizedData.length,
        comVenda: normalizedData.filter(row => (row.valor_venda || 0) > 0).length
      });

      return normalizedData;

    } catch (error: any) {
      console.error('❌ WhatsAppLeadsService: Erro fatal:', error);
      throw error;
    }
  }

  static async fetchValidLeads(activeClient: string): Promise<WhatsAppLead[]> {
    const allLeads = await this.fetchByClient({ 
      activeClient, 
      skipDateFilter: true 
    });

    return allLeads.filter(lead => validatePhoneNumber(lead.telefone));
  }

  static async getStatusDistribution(activeClient: string): Promise<Record<string, number>> {
    try {
      const leads = await this.fetchByClient({ 
        activeClient, 
        skipDateFilter: true 
      });

      return leads.reduce((acc, lead) => {
        const status = lead.status || LEAD_STATUSES.SEM_STATUS;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    } catch (error) {
      console.error('❌ WhatsAppLeadsService: Erro ao calcular distribuição:', error);
      return {};
    }
  }

  static async getSalesMetrics(activeClient: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
  }> {
    try {
      const leads = await this.fetchByClient({ 
        activeClient, 
        skipDateFilter: true 
      });

      const salesLeads = leads.filter(lead => 
        lead.valor_venda && lead.valor_venda > 0
      );

      const totalSales = salesLeads.length;
      const totalRevenue = salesLeads.reduce((sum, lead) => sum + (lead.valor_venda || 0), 0);
      const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const conversionRate = leads.length > 0 ? (totalSales / leads.length) * 100 : 0;

      return {
        totalSales,
        totalRevenue,
        avgOrderValue,
        conversionRate
      };

    } catch (error) {
      console.error('❌ WhatsAppLeadsService: Erro ao calcular vendas:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        conversionRate: 0
      };
    }
  }

  static async getLeadsByPeriod(
    activeClient: string,
    period: 'day' | 'week' | 'month'
  ): Promise<Record<string, WhatsAppLead[]>> {
    try {
      const leads = await this.fetchByClient({ 
        activeClient, 
        skipDateFilter: true 
      });

      return leads.reduce((acc, lead) => {
        let key: string;
        const date = new Date(lead.data_criacao);

        switch (period) {
          case 'day':
            key = lead.data_criacao.substring(0, 10); // YYYY-MM-DD
            break;
          case 'week':
            const week = Math.ceil(date.getDate() / 7);
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${week}`;
            break;
          case 'month':
            key = lead.data_criacao.substring(0, 7); // YYYY-MM
            break;
          default:
            key = lead.data_criacao;
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(lead);
        return acc;
      }, {} as Record<string, WhatsAppLead[]>);

    } catch (error) {
      console.error('❌ WhatsAppLeadsService: Erro ao agrupar por período:', error);
      return {};
    }
  }
}