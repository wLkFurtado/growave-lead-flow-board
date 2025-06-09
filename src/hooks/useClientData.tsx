
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveClient } from './useActiveClient';

export const useClientData = () => {
  const { activeClient } = useActiveClient();
  const [facebookAds, setFacebookAds] = useState<any[]>([]);
  const [whatsappLeads, setWhatsappLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeClient) return;
      
      setIsLoading(true);
      try {
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

        if (fbResponse.error) throw fbResponse.error;
        if (wppResponse.error) throw wppResponse.error;

        setFacebookAds(fbResponse.data || []);
        setWhatsappLeads(wppResponse.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
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
    activeClient
  };
};
