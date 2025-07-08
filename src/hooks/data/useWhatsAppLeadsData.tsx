
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/common';

interface UseWhatsAppLeadsDataOptions {
  activeClient: string;
  dateRange?: DateRange;
  skipDateFilter?: boolean;
  enabled?: boolean;
}

export const useWhatsAppLeadsData = ({ 
  activeClient, 
  dateRange, 
  skipDateFilter = false, 
  enabled = true 
}: UseWhatsAppLeadsDataOptions) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !activeClient || activeClient.trim() === '') {
      console.log('🔄 useWhatsAppLeadsData: Limpando dados - cliente vazio ou disabled');
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log('🔄 useWhatsAppLeadsData: USEEFFECT TRIGGERED para cliente:', `"${activeClient}"`);
    console.log('🔄 useWhatsAppLeadsData: LIMPANDO dados anteriores e iniciando busca...');
    
    // FORÇAR LIMPEZA IMEDIATA DOS DADOS ANTERIORES
    setData([]);
    setError(null);
    setIsLoading(true);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔄 useWhatsAppLeadsData: Buscando dados WPP para:', activeClient);

        let query = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('data_criacao', { ascending: false });

        // Apply date filter if needed
        if (!skipDateFilter && dateRange) {
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
          
          console.log('📅 useWhatsAppLeadsData: Aplicando filtro de data:', {
            from: fromDate,
            to: toDate,
            cliente: activeClient
          });
          
          query = query.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        }

        const { data: wppData, error: wppError } = await query;

        if (wppError) {
          console.error('❌ useWhatsAppLeadsData: Erro:', wppError);
          throw new Error(`Erro WhatsApp: ${wppError.message}`);
        }

        const validatedData = wppData || [];
        
        // Security validation - ensure data belongs to correct client
        const invalidData = validatedData.filter(row => row.cliente_nome !== activeClient);
        if (invalidData.length > 0) {
          console.error('🚨 VAZAMENTO DE DADOS WPP DETECTADO:', {
            invalidCount: invalidData.length,
            expectedClient: activeClient
          });
          throw new Error('Erro de segurança: dados de outros clientes detectados');
        }

        console.log('✅ useWhatsAppLeadsData: Dados WPP validados:', {
          cliente: activeClient,
          total: validatedData.length,
          comVenda: validatedData.filter(row => row.valor_venda > 0).length
        });

        setData(validatedData);
      } catch (err: any) {
        console.error('❌ useWhatsAppLeadsData: Erro fatal:', err);
        setError(err.message || 'Erro ao carregar dados do WhatsApp');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeClient, dateRange, skipDateFilter, enabled]);

  return { data, isLoading, error };
};
