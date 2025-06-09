
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

interface DateRange {
  from: Date;
  to: Date;
}

export const useClientData = (dateRange?: DateRange) => {
  const { activeClient, isLoading: clientLoading } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== useClientData Effect START ===');
    console.log('activeClient:', activeClient);
    console.log('clientLoading:', clientLoading);
    console.log('dateRange:', dateRange);

    const fetchData = async () => {
      // Aguardar o cliente estar carregado
      if (clientLoading) {
        console.log('Cliente ainda carregando, aguardando...');
        return;
      }

      if (!activeClient) {
        console.log('Nenhum cliente ativo, limpando dados e finalizando loading');
        setFacebookAds([]);
        setWhatsappLeads([]);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      console.log('=== INICIANDO BUSCA DE DADOS PARA CLIENTE:', activeClient, '===');
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Período de busca:', dateRange);
        
        // Construir queries base
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data se fornecido
        if (dateRange) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          
          // Garantir que a data final inclua o dia inteiro
          toDate.setHours(23, 59, 59, 999);
          
          const fromDateStr = fromDate.toISOString().split('T')[0];
          const toDateStr = toDate.toISOString().split('T')[0];
          
          console.log('Aplicando filtro de data: De', fromDateStr, 'até', toDateStr);
          
          fbQuery = fbQuery
            .gte('data', fromDateStr)
            .lte('data', toDateStr);
            
          wppQuery = wppQuery
            .gte('data_criacao', fromDateStr)
            .lte('data_criacao', toDateStr);
        }

        console.log('Executando queries em paralelo...');
        const [fbResponse, wppResponse] = await Promise.all([
          fbQuery,
          wppQuery
        ]);

        console.log('=== RESULTADOS DA BUSCA ===');
        console.log('Facebook Response:', {
          success: !fbResponse.error,
          count: fbResponse.data?.length || 0,
          error: fbResponse.error
        });
        console.log('WhatsApp Response:', {
          success: !wppResponse.error,
          count: wppResponse.data?.length || 0,
          error: wppResponse.error
        });

        if (fbResponse.error) {
          console.error('Erro Facebook Ads:', fbResponse.error);
          throw new Error(`Erro ao carregar dados do Facebook: ${fbResponse.error.message}`);
        }
        
        if (wppResponse.error) {
          console.error('Erro WhatsApp:', wppResponse.error);
          throw new Error(`Erro ao carregar dados do WhatsApp: ${wppResponse.error.message}`);
        }

        const fbData = fbResponse.data || [];
        const wppData = wppResponse.data || [];

        console.log('Dados carregados com sucesso:');
        console.log('- Facebook:', fbData.length, 'registros');
        console.log('- WhatsApp:', wppData.length, 'registros');

        setFacebookAds(fbData);
        setWhatsappLeads(wppData);
        setError(null);
        
      } catch (error: any) {
        console.error('=== ERRO NA BUSCA DE DADOS ===', error);
        setError(error.message || 'Erro ao carregar dados');
        setFacebookAds([]);
        setWhatsappLeads([]);
      } finally {
        console.log('=== FINALIZANDO BUSCA DE DADOS ===');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeClient, clientLoading, dateRange]);

  const result = {
    facebookAds,
    whatsappLeads,
    isLoading: isLoading || clientLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };

  console.log('=== useClientData RETURN ===', {
    activeClient: result.activeClient,
    isLoading: result.isLoading,
    hasData: result.hasData,
    fbCount: result.facebookAds.length,
    wppCount: result.whatsappLeads.length,
    error: result.error
  });

  return result;
};
