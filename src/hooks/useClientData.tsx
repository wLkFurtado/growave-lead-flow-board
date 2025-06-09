
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

export const useClientData = () => {
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
        
        const [fbResponse, wppResponse] = await Promise.all([
          supabase
            .from('facebook_ads')
            .select('*')
            .eq('cliente_nome', activeClient),
          supabase
            .from('whatsapp_anuncio')
            .select('*')
            .eq('cliente_nome', activeClient)
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
  }, [activeClient]);

  return {
    facebookAds,
    whatsappLeads,
    isLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };
};
