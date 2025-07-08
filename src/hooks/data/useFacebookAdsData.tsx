
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/common';

interface UseFacebookAdsDataOptions {
  activeClient: string;
  dateRange?: DateRange;
  skipDateFilter?: boolean;
  enabled?: boolean;
}

export const useFacebookAdsData = ({ 
  activeClient, 
  dateRange, 
  skipDateFilter = false, 
  enabled = true 
}: UseFacebookAdsDataOptions) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !activeClient || activeClient.trim() === '') {
      console.log('🔄 useFacebookAdsData: Limpando dados - cliente vazio ou disabled');
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log('🔄 useFacebookAdsData: USEEFFECT TRIGGERED para cliente:', `"${activeClient}"`);
    console.log('🔄 useFacebookAdsData: LIMPANDO dados anteriores e iniciando busca...');
    
    // FORÇAR LIMPEZA IMEDIATA DOS DADOS ANTERIORES
    setData([]);
    setError(null);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔄 useFacebookAdsData: Buscando dados FB para:', activeClient);

        let query = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });

        // Apply date filter if needed
        if (!skipDateFilter && dateRange) {
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
          
          console.log('📅 useFacebookAdsData: Aplicando filtro de data:', {
            from: fromDate,
            to: toDate,
            cliente: activeClient
          });
          
          query = query.gte('data', fromDate).lte('data', toDate);
        }

        const { data: fbData, error: fbError } = await query;

        if (fbError) {
          console.error('❌ useFacebookAdsData: Erro:', fbError);
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

        console.log('✅ useFacebookAdsData: Dados FB validados:', {
          cliente: activeClient,
          total: validatedData.length,
          comInvestimento: validatedData.filter(row => row.investimento > 0).length
        });

        setData(validatedData);
      } catch (err: any) {
        console.error('❌ useFacebookAdsData: Erro fatal:', err);
        setError(err.message || 'Erro ao carregar dados do Facebook');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeClient, dateRange, skipDateFilter, enabled]);

  return { data, isLoading, error };
};
