
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

  console.log('🔄 useClientData: Hook iniciado', {
    activeClient,
    clientLoading
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (clientLoading) {
        console.log('⏳ useClientData: Cliente carregando...');
        return;
      }

      if (!activeClient) {
        console.log('⚠️ useClientData: Nenhum cliente ativo');
        if (mounted) {
          setFacebookAds([]);
          setWhatsappLeads([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }
      
      console.log('🔄 useClientData: Buscando dados para cliente:', activeClient);
      setIsLoading(true);
      setError(null);
      
      try {
        // Buscar dados do Facebook Ads
        let fbQuery = supabase
          .from('facebook_ads')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data', { ascending: false });
          
        // Buscar dados do WhatsApp
        let wppQuery = supabase
          .from('whatsapp_anuncio')
          .select('*')
          .eq('cliente_nome', activeClient)
          .order('data_criacao', { ascending: false });

        // Aplicar filtro de data se fornecido
        if (dateRange) {
          const fromDate = dateRange.from.toISOString().split('T')[0];
          const toDate = dateRange.to.toISOString().split('T')[0];
          
          console.log('🔄 useClientData: Aplicando filtro de data:', fromDate, 'até', toDate);
          
          fbQuery = fbQuery.gte('data', fromDate).lte('data', toDate);
          wppQuery = wppQuery.gte('data_criacao', fromDate).lte('data_criacao', toDate);
        }

        const [fbResponse, wppResponse] = await Promise.all([fbQuery, wppQuery]);

        console.log('✅ useClientData: Dados obtidos:', {
          fb: fbResponse.data?.length || 0,
          wpp: wppResponse.data?.length || 0,
          fbError: fbResponse.error,
          wppError: wppResponse.error
        });

        if (fbResponse.error) {
          console.error('❌ useClientData: Erro FB:', fbResponse.error);
        }
        
        if (wppResponse.error) {
          console.error('❌ useClientData: Erro WPP:', wppResponse.error);
        }

        if (mounted) {
          setFacebookAds(fbResponse.data || []);
          setWhatsappLeads(wppResponse.data || []);
          setError(null);
        }
        
      } catch (error: any) {
        console.error('❌ useClientData: Erro fatal:', error);
        if (mounted) {
          setError(error.message || 'Erro ao carregar dados');
          setFacebookAds([]);
          setWhatsappLeads([]);
        }
      } finally {
        if (mounted) {
          console.log('✅ useClientData: Finalizando loading');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      console.log('🧹 useClientData: Cleanup');
      mounted = false;
    };
  }, [activeClient, clientLoading, dateRange]);

  console.log('📊 useClientData: Estado final:', {
    activeClient,
    isLoading: isLoading || clientLoading,
    fbCount: facebookAds.length,
    wppCount: whatsappLeads.length,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0,
    error
  });

  return {
    facebookAds,
    whatsappLeads,
    isLoading: isLoading || clientLoading,
    error,
    activeClient,
    hasData: facebookAds.length > 0 || whatsappLeads.length > 0
  };
};
