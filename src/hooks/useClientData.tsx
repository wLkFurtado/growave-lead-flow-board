
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
    const fetchData = async () => {
      if (!activeClient) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Buscando dados para o cliente:', activeClient);
        console.log('Período:', dateRange);
        
        // Construir queries com filtro de data se fornecido
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
          // Usar toISOString().split('T')[0] para garantir formato YYYY-MM-DD
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = dateRange.to.toISOString().split('T')[0];
          
          fbQuery = fbQuery
            .gte('data', fromDate)
            .lte('data', toDate);
            
          wppQuery = wppQuery
            .gte('data_criacao', fromDate)
            .lte('data_criacao', toDate);
            
          console.log('Filtro de data aplicado:', fromDate, 'até', toDate);
        }

        const [fbResponse, wppResponse] = await Promise.all([
          fbQuery,
          wppQuery
        ]);

        if (fbResponse.error) {
          console.error('Erro Facebook Ads:', fbResponse.error);
          throw fbResponse.error;
        }
        
        if (wppResponse.error) {
          console.error('Erro WhatsApp:', wppResponse.error);
          throw wppResponse.error;
        }

        console.log('Dados Facebook:', fbResponse.data?.length || 0, 'registros');
        console.log('Dados WhatsApp:', wppResponse.data?.length || 0, 'registros');

        // Se não há dados no período mas temos o cliente, vamos verificar se existem dados sem filtro
        if (dateRange && (!fbResponse.data?.length && !wppResponse.data?.length)) {
          console.log('Verificando se existem dados para este cliente sem filtro de data...');
          
          const [fbAllResponse, wppAllResponse] = await Promise.all([
            supabase
              .from('facebook_ads')
              .select('data')
              .eq('cliente_nome', activeClient)
              .limit(1),
            supabase
              .from('whatsapp_anuncio')
              .select('data_criacao')
              .eq('cliente_nome', activeClient)
              .limit(1)
          ]);
          
          if (fbAllResponse.data?.length || wppAllResponse.data?.length) {
            console.log('Existem dados para este cliente, mas não no período selecionado');
          } else {
            console.log('Não existem dados para este cliente');
          }
        }

        setFacebookAds(fbResponse.data || []);
        setWhatsappLeads(wppResponse.data || []);
      } catch (error: any) {
        console.error('Erro ao buscar dados do cliente:', error);
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
