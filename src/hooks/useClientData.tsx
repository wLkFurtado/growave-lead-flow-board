
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

interface DateRange {
  from: Date;
  to: Date;
}

export const useClientData = (dateRange?: DateRange) => {
  const { activeClient } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== useClientData Effect ===');
    console.log('activeClient:', activeClient);
    console.log('dateRange:', dateRange);

    const fetchData = async () => {
      if (!activeClient) {
        console.log('Nenhum cliente ativo, não buscando dados');
        setFacebookAds([]);
        setWhatsappLeads([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('=== INÍCIO DA BUSCA ===');
        console.log('Cliente ativo:', activeClient);
        console.log('Período:', dateRange);
        
        // Construir queries base
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient);
          
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient);

        // Aplicar filtro de data se fornecido
        if (dateRange) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          
          toDate.setHours(23, 59, 59, 999);
          
          const fromDateStr = fromDate.toISOString().split('T')[0];
          const toDateStr = toDate.toISOString().split('T')[0];
          
          console.log('Aplicando filtro de data:');
          console.log('De:', fromDateStr, 'Até:', toDateStr);
          
          fbQuery = fbQuery
            .gte('data', fromDateStr)
            .lte('data', toDateStr);
            
          wppQuery = wppQuery
            .gte('data_criacao', fromDateStr)
            .lte('data_criacao', toDateStr);
        }

        console.log('Executando queries...');
        const [fbResponse, wppResponse] = await Promise.all([
          fbQuery,
          wppQuery
        ]);

        console.log('=== RESULTADOS ===');
        console.log('Facebook Response:', fbResponse);
        console.log('WhatsApp Response:', wppResponse);

        if (fbResponse.error) {
          console.error('Erro Facebook Ads:', fbResponse.error);
          throw fbResponse.error;
        }
        
        if (wppResponse.error) {
          console.error('Erro WhatsApp:', wppResponse.error);
          throw wppResponse.error;
        }

        const fbData = fbResponse.data || [];
        const wppData = wppResponse.data || [];

        console.log('Dados encontrados:');
        console.log('Facebook:', fbData.length, 'registros');
        console.log('WhatsApp:', wppData.length, 'registros');

        setFacebookAds(fbData);
        setWhatsappLeads(wppData);
        
      } catch (error: any) {
        console.error('=== ERRO ===', error);
        setError(error.message || 'Erro ao carregar dados');
        setFacebookAds([]);
        setWhatsappLeads([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeClient, dateRange]);

  return {
    facebookAds,
    whatsappLeads,
    isLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };
};
