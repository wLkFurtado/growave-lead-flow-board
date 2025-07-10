import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/common';

interface UseFacebookAdsQueryOptions {
  activeClient: string;
  dateRange?: DateRange;
  skipDateFilter?: boolean;
  enabled?: boolean;
}

export const useFacebookAdsQuery = ({ 
  activeClient, 
  dateRange, 
  skipDateFilter = false, 
  enabled = true 
}: UseFacebookAdsQueryOptions) => {
  
  return useQuery({
    queryKey: [
      'facebook-ads', 
      activeClient, 
      skipDateFilter ? 'no-date-filter' : dateRange?.from?.toISOString(), 
      skipDateFilter ? 'no-date-filter' : dateRange?.to?.toISOString()
    ],
    queryFn: async () => {
      if (!activeClient || activeClient.trim() === '') {
        console.log('🔄 useFacebookAdsQuery: Cliente vazio, retornando array vazio');
        return [];
      }

      console.log('🔄 useFacebookAdsQuery: Buscando dados FB para:', activeClient);
      console.log('📊 useFacebookAdsQuery: Query Key:', [
        'facebook-ads', 
        activeClient, 
        skipDateFilter ? 'no-date-filter' : dateRange?.from?.toISOString(), 
        skipDateFilter ? 'no-date-filter' : dateRange?.to?.toISOString()
      ]);

      let query = supabase
        .from('facebook_ads')
        .select('*')
        .eq('cliente_nome', activeClient)
        .order('data', { ascending: false });

      // Apply date filter if needed
      if (!skipDateFilter && dateRange) {
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
        
        console.log('📅 useFacebookAdsQuery: Aplicando filtro de data:', {
          from: fromDate,
          to: toDate,
          cliente: activeClient
        });
        
        query = query.gte('data', fromDate).lte('data', toDate);
      }

      const { data: fbData, error: fbError } = await query;

      if (fbError) {
        console.error('❌ useFacebookAdsQuery: Erro:', fbError);
        throw new Error(`Erro Facebook: ${fbError.message}`);
      }

      const validatedData = fbData || [];
      
      // Security validation - ensure data belongs to correct client
      const invalidData = validatedData.filter(row => row.cliente_nome !== activeClient);
      if (invalidData.length > 0) {
        console.error('🚨 VAZAMENTO DE DADOS FB DETECTADO:', {
          invalidCount: invalidData.length,
          expectedClient: activeClient
        });
        throw new Error('Erro de segurança: dados de outros clientes detectados');
      }

      console.log('✅ useFacebookAdsQuery: Dados FB validados:', {
        cliente: activeClient,
        total: validatedData.length,
        comInvestimento: validatedData.filter(row => row.investimento > 0).length
      });

      return validatedData;
    },
    enabled: enabled && !!activeClient && activeClient.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
    // ✅ Removido refetchOnWindowFocus: false para usar configuração global
    retry: (failureCount, error) => {
      // Não tentar novamente em caso de erro de segurança
      if (error.message.includes('segurança')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};