import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/types/common';

interface UseClientDateRangeOptions {
  activeClient: string;
  enabled?: boolean;
}

export const useClientDateRange = ({ activeClient, enabled = true }: UseClientDateRangeOptions) => {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState({ facebook: 0, whatsapp: 0 });

  useEffect(() => {
    if (!enabled || !activeClient || activeClient.trim() === '') {
      setDateRange(null);
      setTotalRecords({ facebook: 0, whatsapp: 0 });
      return;
    }

    const detectDateRange = async () => {
      setIsLoading(true);
      
      try {
        console.log('🔍 useClientDateRange: Detectando período para cliente:', activeClient);

        // Buscar período de dados do Facebook
        const { data: fbData, error: fbError } = await supabase
          .from('facebook_ads')
          .select('data')
          .eq('cliente_nome', activeClient)
          .not('data', 'is', null)
          .order('data', { ascending: true });

        // Buscar período de dados do WhatsApp
        const { data: wppData, error: wppError } = await supabase
          .from('whatsapp_anuncio')
          .select('data_criacao')
          .eq('cliente_nome', activeClient)
          .not('data_criacao', 'is', null)
          .order('data_criacao', { ascending: true });

        if (fbError || wppError) {
          console.error('❌ Erro ao detectar período:', fbError || wppError);
          return;
        }

        const allDates: Date[] = [];
        
        // Adicionar datas do Facebook
        if (fbData && fbData.length > 0) {
          fbData.forEach(row => {
            if (row.data) allDates.push(new Date(row.data));
          });
        }

        // Adicionar datas do WhatsApp
        if (wppData && wppData.length > 0) {
          wppData.forEach(row => {
            if (row.data_criacao) allDates.push(new Date(row.data_criacao));
          });
        }

        // Atualizar contadores
        setTotalRecords({
          facebook: fbData?.length || 0,
          whatsapp: wppData?.length || 0
        });

        if (allDates.length > 0) {
          // Ordenar datas
          allDates.sort((a, b) => a.getTime() - b.getTime());
          
          const minDate = allDates[0];
          const maxDate = allDates[allDates.length - 1];
          
          console.log('✅ useClientDateRange: Período detectado para', activeClient, {
            from: minDate.toISOString().split('T')[0],
            to: maxDate.toISOString().split('T')[0],
            totalFB: fbData?.length || 0,
            totalWPP: wppData?.length || 0
          });

          setDateRange({
            from: minDate,
            to: maxDate
          });
        } else {
          console.log('⚠️ useClientDateRange: Nenhuma data encontrada para:', activeClient);
          setDateRange(null);
        }
        
      } catch (error) {
        console.error('❌ useClientDateRange: Erro fatal:', error);
        setDateRange(null);
        setTotalRecords({ facebook: 0, whatsapp: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    detectDateRange();
  }, [activeClient, enabled]);

  return {
    dateRange,
    isLoading,
    totalRecords,
    hasData: (totalRecords.facebook + totalRecords.whatsapp) > 0
  };
};